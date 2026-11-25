/**
 * Workspace-defined custom fields on people and companies.
 *
 * A workspace defines fields (`custom_field` rows); a record stores its values
 * in its `custom_fields` column, keyed by field id. Select and multi-select
 * values hold option ids, so renaming an option never rewrites records
 */

/** Records a custom field can be defined on */
const CUSTOM_FIELD_ENTITIES = ["person", "company"] as const;

type CustomFieldEntity = (typeof CUSTOM_FIELD_ENTITIES)[number];

const CUSTOM_FIELD_TYPES = [
  "text",
  "number",
  "date",
  "checkbox",
  "select",
  "multi_select",
] as const;

type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

export interface CustomFieldOption {
  id: string;
  label: string;
}

/** The parts of a field definition that decide which values are valid */
export interface CustomFieldDefinition {
  id: string;
  type: string;
  options: unknown;
}

const MAX_LABEL_LENGTH = 80;
const MAX_OPTIONS = 100;
const MAX_TEXT_LENGTH = 2000;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const isSelect = (type: string): boolean =>
  type === "select" || type === "multi_select";

const optionIds = (options: unknown): Set<string> =>
  new Set(
    Array.isArray(options)
      ? options
          .map((option) => (option as { id?: unknown })?.id)
          .filter((id): id is string => typeof id === "string")
      : [],
  );

/**
 * Why a field definition's entity, type, label or options are invalid, or
 * null when they are valid. Only the fields present are checked, so a patch
 * that changes the label alone is checked for the label alone. Pass the
 * current type with `options` on an update, since the options rules depend
 * on it
 */
export const customFieldDefinitionError = (definition: {
  entity?: unknown;
  type?: unknown;
  label?: unknown;
  options?: unknown;
}): string | null => {
  const { entity, type, label, options } = definition;

  if (
    entity !== undefined &&
    !CUSTOM_FIELD_ENTITIES.includes(entity as CustomFieldEntity)
  ) {
    return "Custom fields can be added to people or companies";
  }

  if (
    type !== undefined &&
    !CUSTOM_FIELD_TYPES.includes(type as CustomFieldType)
  ) {
    return "Unknown custom field type";
  }

  if (label !== undefined) {
    if (typeof label !== "string" || !label.trim()) {
      return "A custom field needs a name";
    }
    if (label.length > MAX_LABEL_LENGTH) {
      return `A custom field name can be at most ${MAX_LABEL_LENGTH} characters`;
    }
  }

  if (options !== undefined && options !== null) {
    if (!Array.isArray(options)) return "Options must be a list";
    if (options.length > MAX_OPTIONS) {
      return `A field can have at most ${MAX_OPTIONS} options`;
    }

    const ids = new Set<string>();
    for (const option of options) {
      const { id, label: optionLabel } = (option ?? {}) as {
        id?: unknown;
        label?: unknown;
      };
      if (typeof id !== "string" || !id || ids.has(id)) {
        return "Each option needs its own id";
      }
      ids.add(id);
      if (typeof optionLabel !== "string" || !optionLabel.trim()) {
        return "Each option needs a name";
      }
      if (optionLabel.length > MAX_LABEL_LENGTH) {
        return `An option name can be at most ${MAX_LABEL_LENGTH} characters`;
      }
    }

    if (typeof type === "string" && isSelect(type) && options.length === 0) {
      return "A select field needs at least one option";
    }
  }

  return null;
};

/** Why one value does not fit its field, or null when it does */
const valueError = (
  definition: CustomFieldDefinition,
  value: unknown,
): string | null => {
  // null clears the value, whatever the type
  if (value === null) return null;

  switch (definition.type) {
    case "text":
      if (typeof value !== "string") return "must be text";
      if (value.length > MAX_TEXT_LENGTH) {
        return `can be at most ${MAX_TEXT_LENGTH} characters`;
      }
      return null;
    case "number":
      return typeof value === "number" && Number.isFinite(value)
        ? null
        : "must be a number";
    case "date":
      return typeof value === "string" &&
        DATE.test(value) &&
        !Number.isNaN(Date.parse(value))
        ? null
        : "must be a date (YYYY-MM-DD)";
    case "checkbox":
      return typeof value === "boolean" ? null : "must be true or false";
    case "select":
      return typeof value === "string" &&
        optionIds(definition.options).has(value)
        ? null
        : "must be one of the field's options";
    case "multi_select": {
      if (!Array.isArray(value)) return "must be a list of options";
      const ids = optionIds(definition.options);
      return value.every((v) => typeof v === "string" && ids.has(v)) &&
        new Set(value).size === value.length
        ? null
        : "must only hold the field's options, each once";
    }
    default:
      return "has an unknown type";
  }
};

/**
 * Why a record's custom field values do not fit the workspace's fields for
 * that record type, or null when they all do. Every key must be one of the
 * fields, and every value must match its field's type
 */
export const customFieldValuesError = (
  values: unknown,
  definitions: readonly CustomFieldDefinition[],
): string | null => {
  if (values === null || values === undefined) return null;
  if (typeof values !== "object" || Array.isArray(values)) {
    return "Custom field values must be an object";
  }

  const byId = new Map(definitions.map((d) => [d.id, d]));
  for (const [id, value] of Object.entries(values)) {
    const definition = byId.get(id);
    if (!definition) return "A custom field in this record no longer exists";

    const error = valueError(definition, value);
    if (error) return `A custom field value ${error}`;
  }

  return null;
};
