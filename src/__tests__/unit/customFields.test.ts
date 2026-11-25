import { describe, expect, test } from "bun:test";

import {
  customFieldDefinitionError,
  customFieldValuesError,
} from "lib/customFields";

const stage = {
  id: "f-stage",
  type: "select",
  options: [
    { id: "lead", label: "Lead" },
    { id: "won", label: "Won" },
  ],
};
const services = {
  id: "f-services",
  type: "multi_select",
  options: [
    { id: "brand", label: "Brand" },
    { id: "web", label: "Web" },
  ],
};
const budget = { id: "f-budget", type: "number", options: [] };
const met = { id: "f-met", type: "date", options: [] };
const vip = { id: "f-vip", type: "checkbox", options: [] };
const source = { id: "f-source", type: "text", options: [] };
const fields = [stage, services, budget, met, vip, source];

describe("customFieldDefinitionError", () => {
  test("accepts a select field with options", () => {
    expect(
      customFieldDefinitionError({
        entity: "person",
        type: "select",
        label: "Stage",
        options: stage.options,
      }),
    ).toBeNull();
  });

  test("refuses an unknown entity, type, or a blank label", () => {
    expect(customFieldDefinitionError({ entity: "invoice" })).not.toBeNull();
    expect(customFieldDefinitionError({ type: "color" })).not.toBeNull();
    expect(customFieldDefinitionError({ label: "  " })).not.toBeNull();
  });

  test("refuses a select field without options", () => {
    expect(
      customFieldDefinitionError({ type: "select", options: [] }),
    ).not.toBeNull();
  });

  test("refuses duplicate or unnamed options", () => {
    expect(
      customFieldDefinitionError({
        type: "select",
        options: [
          { id: "a", label: "A" },
          { id: "a", label: "B" },
        ],
      }),
    ).not.toBeNull();
    expect(
      customFieldDefinitionError({
        type: "select",
        options: [{ id: "a", label: "" }],
      }),
    ).not.toBeNull();
  });
});

describe("customFieldValuesError", () => {
  test("accepts values that fit every field", () => {
    expect(
      customFieldValuesError(
        {
          "f-stage": "won",
          "f-services": ["brand", "web"],
          "f-budget": 12000,
          "f-met": "2026-11-24",
          "f-vip": true,
          "f-source": "Referral",
        },
        fields,
      ),
    ).toBeNull();
  });

  test("accepts null to clear a value, and an empty object", () => {
    expect(customFieldValuesError({ "f-stage": null }, fields)).toBeNull();
    expect(customFieldValuesError({}, fields)).toBeNull();
  });

  test("refuses a field the workspace does not have", () => {
    expect(customFieldValuesError({ "f-other": "x" }, fields)).not.toBeNull();
  });

  test("refuses values of the wrong shape", () => {
    for (const values of [
      { "f-stage": "gone" },
      { "f-services": ["brand", "brand"] },
      { "f-services": "brand" },
      { "f-budget": "12000" },
      { "f-met": "24/11/2026" },
      { "f-vip": "yes" },
      { "f-source": 5 },
    ]) {
      expect(customFieldValuesError(values, fields)).not.toBeNull();
    }
  });

  test("refuses a non-object", () => {
    expect(customFieldValuesError(["x"], fields)).not.toBeNull();
  });
});
