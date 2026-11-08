import { z } from "zod";
import { formFields } from "@/lib/resources";
import { slugify, toArray } from "@/lib/utils";

/**
 * Builds a Zod schema from a resource's field definitions, so validation stays
 * in one place and never drifts from the form.
 */
export function buildResourceSchema(resource) {
  const shape = {};

  for (const f of formFields(resource)) {
    let schema;

    switch (f.type) {
      case "number":
        schema = z.preprocess(
          (value) => (value === "" || value == null ? null : Number(value)),
          z
            .number({ invalid_type_error: `${f.label} must be a number` })
            .int(`${f.label} must be a whole number`)
            .nullable()
        );
        break;

      case "switch":
        schema = z.preprocess(
          (value) => value === true || value === "on" || value === "true" || value === "1",
          z.boolean()
        );
        break;

      case "tags":
        schema = z.preprocess(
          (value) => toArray(value),
          z.array(z.string().max(120)).max(40)
        );
        break;

      case "date":
        schema = z.preprocess(
          (value) => (value === "" || value == null ? null : value),
          z
            .string()
            .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
            .nullable()
        );
        break;

      case "select":
        schema = z.preprocess((value) => {
          if (value === "" || value == null) return f.defaultValue ?? null;
          return value;
        }, z.string().max(80).nullable());
        break;

      case "email":
        schema = z.preprocess(
          (value) => (value === "" || value == null ? null : value),
          z.string().email("Enter a valid email address").nullable()
        );
        break;

      case "url":
        schema = z.preprocess(
          (value) => (value === "" || value == null ? null : value),
          z
            .string()
            .refine(
              (value) => /^https?:\/\//i.test(value) || value.startsWith("/"),
              "Enter a full URL starting with https://"
            )
            .nullable()
        );
        break;

      default:
        schema = z.preprocess(
          (value) => (value === "" || value == null ? null : String(value).trim()),
          z.string().max(20000).nullable()
        );
    }

    shape[f.name] = schema;
  }

  return z.object(shape).superRefine((data, ctx) => {
    for (const f of formFields(resource)) {
      if (!f.required) continue;
      const value = data[f.name];
      const isEmpty =
        value == null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [f.name],
          message: `${f.label} is required`,
        });
      }
    }
  });
}

/** Validate submitted form data. Returns { data, errors }. */
export function validateResource(resource, rawValues) {
  const schema = buildResourceSchema(resource);
  const result = schema.safeParse(rawValues);

  if (result.success) {
    const data = { ...result.data };

    // Auto-generate a slug when the resource uses one.
    if (resource.slug && !data.slug) {
      const source = data.title || data.full_name || "";
      data.slug = slugify(source);
    }
    if (resource.slug && data.slug) {
      data.slug = slugify(data.slug);
    }

    // Sensible defaults for publishing controls.
    if ("is_published" in data && data.is_published == null) data.is_published = false;
    if ("sort_order" in data && data.sort_order == null) data.sort_order = 0;

    return { data, errors: null };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] ?? "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return { data: null, errors };
}

/** Convert FormData into a plain object of raw strings/booleans. */
export function formDataToValues(formData) {
  const values = {};
  for (const [key, value] of formData.entries()) {
    if (key === "gallery") continue;
    if (key.startsWith("$")) continue;
    if (values[key] === undefined) {
      values[key] = typeof value === "string" ? value : undefined;
    }
  }
  return values;
}
