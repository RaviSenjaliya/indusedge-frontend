/**
 * Client-side validation.
 *
 * Mirrors the rules the API enforces in `backend/validators.js` so a user gets
 * an instant, specific message instead of a round trip. The server remains the
 * authority — this only saves a request and improves the feel of the form.
 */

export type FieldErrors = Record<string, string>;

const PHONE_PATTERN = /^[0-9+][0-9\s()+-]{6,19}$/;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const URL_PATTERN = /^(https?:\/\/|\/)[^\s]*$/i;

interface Rule {
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
}

const checkField = (value: unknown, rule: Rule): string | undefined => {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    return rule.required ? `${rule.label} is required` : undefined;
  }
  if (rule.min && text.length < rule.min) {
    return `${rule.label} must be at least ${rule.min} characters`;
  }
  if (rule.max && text.length > rule.max) {
    return `${rule.label} must be ${rule.max} characters or fewer`;
  }
  if (rule.pattern && !rule.pattern.test(text)) {
    return rule.message || `${rule.label} is not valid`;
  }
  return undefined;
};

const runRules = (
  values: Record<string, unknown>,
  rules: Record<string, Rule>
): FieldErrors => {
  const errors: FieldErrors = {};
  for (const [key, rule] of Object.entries(rules)) {
    const message = checkField(values[key], rule);
    if (message) errors[key] = message;
  }
  return errors;
};

/**
 * Public contact form. Field names match the form inputs, not the API payload
 * (`name` here becomes `customerName` server-side).
 */
export const validateInquiryForm = (values: {
  name?: string;
  phone?: string;
  state?: string;
  city?: string;
  message?: string;
}): FieldErrors =>
  runRules(values, {
    name: { label: "Name", required: true, min: 2, max: 120 },
    phone: {
      label: "Phone number",
      required: true,
      max: 20,
      pattern: PHONE_PATTERN,
      message: "Enter a valid phone number (at least 7 digits)",
    },
    state: { label: "State", required: true, max: 100 },
    city: { label: "City", required: true, max: 100 },
    message: { label: "Message", max: 2000 },
  });

export const validateProductForm = (values: Record<string, unknown>): FieldErrors =>
  runRules(values, {
    id: {
      label: "Product ID",
      required: true,
      max: 100,
      pattern: ID_PATTERN,
      message: "Product ID may only contain letters, numbers, - and _",
    },
    name: { label: "Product name", required: true, max: 200 },
    categoryId: { label: "Category", required: true, max: 100 },
    shortDescription: { label: "Short description", max: 500 },
    description: { label: "Description", max: 5000 },
  });

export const validateCategoryForm = (values: Record<string, unknown>): FieldErrors =>
  runRules(values, {
    id: {
      label: "Category ID",
      required: true,
      max: 100,
      pattern: ID_PATTERN,
      message: "Category ID may only contain letters, numbers, - and _",
    },
    name: { label: "Category name", required: true, max: 200 },
    description: { label: "Description", max: 5000 },
    image: {
      label: "Image URL",
      max: 2000,
      pattern: URL_PATTERN,
      message: "Image URL must start with http://, https:// or /",
    },
  });

export const validateProjectForm = (values: Record<string, unknown>): FieldErrors =>
  runRules(values, {
    id: {
      label: "Project ID",
      required: true,
      max: 100,
      pattern: ID_PATTERN,
      message: "Project ID may only contain letters, numbers, - and _",
    },
    title: { label: "Project title", required: true, max: 200 },
    category: { label: "Category", max: 100 },
    location: { label: "Location", max: 200 },
    year: {
      label: "Year",
      max: 10,
      pattern: /^[0-9]{4}$/,
      message: "Year must be four digits",
    },
    description: { label: "Description", max: 5000 },
  });

export const hasErrors = (errors: FieldErrors): boolean =>
  Object.keys(errors).length > 0;

/** Maps API field names back to the inquiry form's input names. */
export const API_TO_INQUIRY_FIELD: Record<string, string> = {
  customerName: "name",
  phone: "phone",
  state: "state",
  city: "city",
  message: "message",
};
