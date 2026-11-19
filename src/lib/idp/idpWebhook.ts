import { createHmac, timingSafeEqual } from "node:crypto";

import { Elysia, t } from "elysia";

import { IDP_WEBHOOK_SECRET } from "lib/config/env.config";
import { dbPool } from "lib/db/db";
import { deleteOrganizationData } from "lib/idp/deleteOrganizationData";

/** Constant-time check of a hex HMAC-SHA256 signature over the raw body */
const verifySignature = (
  rawBody: string,
  signature: string,
  secret: string,
): boolean => {
  try {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

interface IdpWebhookDeps {
  /** Database client, defaults to the production pool */
  db?: typeof dbPool;
  /**
   * Shared secret Vortex signs identity events with, defaults to
   * IDP_WEBHOOK_SECRET. When unset every request is refused (fail closed)
   */
  webhookSecret?: string;
}

/**
 * `POST /webhooks/idp`: Gatekeeper identity events, delivered by Vortex as
 * HMAC-signed webhooks (`x-idp-signature`, hex HMAC-SHA256 of the raw body).
 *
 * Handles `organization.deleted`: everything the deleted workspace keeps in
 * Mantle is deleted (see deleteOrganizationData). Other events are acked
 * without effect.
 *
 * No secret is a 503, a missing or bad signature a 401, an unreadable body or
 * a missing organization id a 400, and a failed deletion a 500 so Vortex
 * retries it (the deletion is idempotent)
 */
export const createIdpWebhook = ({
  db = dbPool,
  webhookSecret = IDP_WEBHOOK_SECRET,
}: IdpWebhookDeps = {}) =>
  new Elysia({ name: "idp-webhook" }).post(
    "/webhooks/idp",
    async ({ request, headers, set }) => {
      const rawBody = await request.text();
      const signature = headers["x-idp-signature"];

      if (!webhookSecret) {
        console.warn(
          "IDP_WEBHOOK_SECRET not set, rejecting unverifiable IDP webhook",
        );
        set.status = 503;
        return { error: "Webhook secret not configured" };
      }
      if (!signature) {
        set.status = 401;
        return { error: "Missing signature" };
      }
      if (!verifySignature(rawBody, signature, webhookSecret)) {
        set.status = 401;
        return { error: "Invalid signature" };
      }

      let event: { eventType?: unknown; organizationId?: unknown };
      try {
        event = JSON.parse(rawBody);
      } catch {
        set.status = 400;
        return { error: "Invalid JSON" };
      }

      if (event.eventType !== "organization.deleted") {
        console.warn(
          `[IDP Webhook] Unhandled event type: ${String(event.eventType)}`,
        );
        return { received: true };
      }

      const { organizationId } = event;
      if (typeof organizationId !== "string" || !organizationId) {
        set.status = 400;
        return { error: "Missing organizationId" };
      }

      try {
        const counts = await deleteOrganizationData(organizationId, db);
        // biome-ignore lint/suspicious/noConsole: webhook observability
        console.log(
          `[IDP Webhook] organization.deleted for ${organizationId}: ${JSON.stringify(counts)}`,
        );
      } catch (err) {
        console.error(
          `[IDP Webhook] organization.deleted for ${organizationId} failed`,
          err,
        );
        set.status = 500;
        return { error: "Internal Server Error" };
      }

      return { received: true };
    },
    {
      headers: t.Object({
        "x-idp-signature": t.Optional(t.String()),
        "x-idp-event": t.Optional(t.String()),
      }),
    },
  );

const idpWebhook = createIdpWebhook();

export default idpWebhook;
