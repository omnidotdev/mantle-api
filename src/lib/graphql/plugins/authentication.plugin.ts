import type { ResolveUserFn } from "@envelop/generic-auth";
import { useGenericAuth } from "@envelop/generic-auth";
import { AUTH_BASE_URL } from "lib/config/env.config";
import type { GraphQLContext } from "lib/graphql/createGraphqlContext";

/**
 * Observer type - represents the authenticated entity.
 */
export interface Observer {
	id: string;
	email?: string;
	name?: string;
}

/**
 * Validate user session via token introspection.
 * @see https://the-guild.dev/graphql/envelop/plugins/use-generic-auth#getting-started
 */
const resolveUser: ResolveUserFn<Observer, GraphQLContext> = async (ctx) => {
	const accessToken = ctx.request.headers
		.get("authorization")
		?.split("Bearer ")[1];

	if (!accessToken) {
		return null;
	}

	try {
		const response = await fetch(`${AUTH_BASE_URL}/oauth/userinfo`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			return null;
		}

		const userInfo = (await response.json()) as {
			sub: string;
			email?: string;
			name?: string;
		};

		return {
			id: userInfo.sub,
			email: userInfo.email,
			name: userInfo.name,
		};
	} catch {
		return null;
	}
};

/**
 * Authentication plugin.
 * Validates tokens via HIDRA userinfo endpoint.
 * @see https://the-guild.dev/graphql/envelop/plugins/use-generic-auth
 */
const authenticationPlugin = useGenericAuth({
	contextFieldName: "observer",
	resolveUserFn: resolveUser,
	mode: "protect-all",
});

export default authenticationPlugin;
