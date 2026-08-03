import { Product, Category, Inquiry, InquiryStatus, Project } from "../types";
import { PRODUCTS, CATEGORIES } from "../constants";
import { PROJECTS } from "../data/projects";

/**
 * In production the API lives on its own host, so VITE_API_BASE_URL must be
 * set at build time (e.g. https://indusedge-backend.onrender.com/api).
 * Locally it stays empty and requests go through the Vite dev proxy.
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/$/,
  ""
);
const STORAGE_KEYS = {
  PRODUCTS: "indusedge_products_v1",
  CATEGORIES: "indusedge_categories_v1",
  INQUIRIES: "indusedge_inquiries_v1",
  IMAGES: "indusedge_images_v1",
  PROJECTS: "indusedge_projects_v1",
  TOKEN: "indusedge_token",
  AUTH: "indusedge_admin_auth",
};

/** btoa() throws on non-ASCII, so encode as UTF-8 bytes first. */
const toBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH);
};

/**
 * The backend authenticates every privileged request on its own, so the admin
 * credentials travel with each one. Empty for anonymous visitors.
 */
const authHeaders = (): Record<string, string> => {
  const credentials = localStorage.getItem(STORAGE_KEYS.AUTH);
  return credentials ? { Authorization: `Basic ${credentials}` } : {};
};

/** Thrown when the server rejects the admin credentials. */
export class AuthError extends Error {
  constructor(message = "Admin session rejected. Please log in again.") {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Thrown when the API answered with an error. `fields` maps a field name to a
 * human-readable message, so a form can show it next to the offending input.
 */
export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fields: Record<string, string> = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }

  /** First field message, useful for a single-line form error. */
  get firstFieldMessage(): string | undefined {
    return Object.values(this.fields)[0];
  }
}

/**
 * Turns any thrown error into a title/detail pair suitable for a toast.
 * Field-level validation messages are preferred because they tell the user
 * exactly what to change.
 */
export const describeError = (
  err: unknown
): { title: string; detail: string } => {
  if (err instanceof AuthError) {
    return { title: "Session expired", detail: err.message };
  }
  if (err instanceof ApiError) {
    const fieldMessages = Object.values(err.fields);
    if (fieldMessages.length > 0) {
      return {
        title: "Please check the form",
        detail: fieldMessages.join(" "),
      };
    }
    return { title: "Request rejected", detail: err.message };
  }
  return {
    title: "Something went wrong",
    detail: "Could not reach the server. Please try again.",
  };
};

const readError = async (response: Response): Promise<ApiError> => {
  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON error body (proxy HTML, empty response, …)
  }
  return new ApiError(
    response.status,
    payload?.error || `Request failed (${response.status})`,
    payload?.fields || {}
  );
};

/**
 * Ensures the app has a baseline dataset even if the API is unreachable.
 */
const initLocalStore = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.IMAGES)) {
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(PROJECTS));
  }
};

initLocalStore();

/**
 * Standardized fetch wrapper that implements the Fallback Strategy.
 */
const fetchWithFallback = async <T>(
  endpoint: string,
  options: RequestInit,
  localGetter: () => T,
  localSetter: (data: T) => void
): Promise<T> => {
  const method = (options.method || "GET").toUpperCase();
  const isRead = method === "GET";
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...options?.headers,
      },
    });
  } catch {
    // The request never reached the server (offline, DNS, timeout). This is
    // the only case the local fallback is meant for.
    console.warn(
      `[IndusEdge Resilience] API unreachable at ${endpoint}. Using Local Node.`
    );
    return localGetter();
  }

  if (!response.ok) {
    // Auth failures must never fall through to local data: silently serving a
    // cached copy would make the admin panel look like the change was saved.
    if (response.status === 401 || response.status === 403) {
      clearAuth();
      throw new AuthError();
    }
    if (response.status === 429) {
      throw new AuthError("Too many failed attempts. Try again later.");
    }

    const error = await readError(response);

    // Reads stay resilient when the server itself is broken, so the storefront
    // still renders. Writes and rejected input must surface — a validation
    // error silently "succeeding" is how bad data goes unnoticed.
    if (isRead && response.status >= 500) {
      console.warn(
        `[IndusEdge Resilience] API error ${response.status} at ${endpoint}. Using Local Node.`
      );
      return localGetter();
    }

    throw error;
  }

  const data = await response.json();

  // On success, sync back to local storage
  if (isRead && Array.isArray(data)) {
    localSetter(data as T);
  }

  return data as T;
};

const getLocalProducts = (): Product[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]");
const getLocalCategories = (): Category[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
const getLocalInquiries = (): Inquiry[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || "[]");
const getLocalImages = (): any[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.IMAGES) || "[]");
const getLocalProjects = (): Project[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || "[]");

export const db = {
  // --- Connection Check ---
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: "GET",
        signal: AbortSignal.timeout(5000), // Balanced timeout for health check
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.status === "ok" && data.database === "connected";
    } catch {
      return false;
    }
  },

  // --- Categories ---
  getCategories: async (): Promise<Category[]> => {
    return fetchWithFallback(
      "/categories",
      { method: "GET" },
      getLocalCategories,
      (data) => {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
      }
    );
  },

  saveCategory: async (category: Category) => {
    const result = await fetchWithFallback(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify(category),
      },
      () => category,
      () => {}
    );

    const cats = getLocalCategories();
    const idx = cats.findIndex((c) => c.id === category.id);
    if (idx > -1) cats[idx] = category;
    else cats.push(category);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
    return result;
  },

  deleteCategory: async (id: string) => {
    await fetchWithFallback(
      `/categories/${id}`,
      { method: "DELETE" },
      () => null,
      () => {}
    );
    const cats = getLocalCategories().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  },

  // --- Products ---
  getProducts: async (): Promise<Product[]> => {
    return fetchWithFallback(
      "/products",
      { method: "GET" },
      getLocalProducts,
      (data) => {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
      }
    );
  },

  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (response.ok) return await response.json();
      throw new Error();
    } catch {
      return getLocalProducts().find((p) => p.id === id) || null;
    }
  },

  saveProduct: async (product: Product) => {
    const result = await fetchWithFallback(
      "/products",
      {
        method: "POST",
        body: JSON.stringify(product),
      },
      () => product,
      () => {}
    );

    const prods = getLocalProducts();
    const idx = prods.findIndex((p) => p.id === product.id);
    if (idx > -1) prods[idx] = product;
    else prods.push(product);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
    return result;
  },

  deleteProduct: async (id: string) => {
    await fetchWithFallback(
      `/products/${id}`,
      { method: "DELETE" },
      () => null,
      () => {}
    );
    const prods = getLocalProducts().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
  },

  // --- Inquiries ---
  getInquiries: async (): Promise<Inquiry[]> => {
    return fetchWithFallback(
      "/inquiries",
      { method: "GET" },
      getLocalInquiries,
      (data) => {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(data));
      }
    );
  },

  addInquiry: async (formData: any) => {
    const newInquiry: Inquiry = {
      id: "inq_" + Math.random().toString(36).substr(2, 9),
      customerName: formData.name,
      phone: formData.phone,
      state: formData.state,
      city: formData.city,
      message: formData.message || "",
      productId: formData.productId,
      productName: formData.productName,
      status: "NEW",
      createdAt: new Date().toISOString(),
    };

    const result = await fetchWithFallback(
      "/inquiries",
      {
        method: "POST",
        body: JSON.stringify(newInquiry),
      },
      () => newInquiry,
      () => {}
    );

    const inqs = getLocalInquiries();
    inqs.push(result);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inqs));
    return result;
  },

  updateInquiryStatus: async (id: string, status: InquiryStatus) => {
    await fetchWithFallback(
      `/inquiries/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
      () => null,
      () => {}
    );

    const inqs = getLocalInquiries();
    const idx = inqs.findIndex((i) => i.id === id);
    if (idx > -1) {
      inqs[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inqs));
    }
  },

  deleteInquiry: async (id: string) => {
    await fetchWithFallback(
      `/inquiries/${id}`,
      { method: "DELETE" },
      () => null,
      () => {}
    );
    const inqs = getLocalInquiries().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inqs));
  },

  // --- Media ---
  getImages: async (): Promise<any[]> => {
    return fetchWithFallback(
      "/images",
      { method: "GET" },
      getLocalImages,
      (data) => {
        localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(data));
      }
    );
  },

  uploadImage: async (file: File, categoryId?: string): Promise<any> => {
    const formData = new FormData();
    formData.append("image", file);
    if (categoryId) {
      formData.append("categoryId", categoryId);
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      // No Content-Type here on purpose — the browser must set the multipart
      // boundary itself.
      headers: authHeaders(),
      body: formData,
    });

    if (response.status === 401 || response.status === 403) {
      clearAuth();
      throw new AuthError();
    }

    if (!response.ok) {
      // Carries field messages such as "Image must be 5 MB or smaller".
      throw await readError(response);
    }

    const data = await response.json();
    // Ensure categoryId is preserved in returned data (mocking backend behavior if needed)
    if (categoryId) data.categoryId = categoryId;

    // Sync to local
    const imgs = getLocalImages();
    imgs.unshift(data);
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(imgs));

    return data;
  },

  deleteImage: async (id: string) => {
    await fetchWithFallback(
      `/images?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
      () => null,
      () => {}
    );
    const imgs = getLocalImages().filter((img) => img.publicId !== id);
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(imgs));
  },

  updateImageCategory: async (id: string, categoryId: string) => {
    await fetchWithFallback(
      `/images/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ categoryId }),
      },
      () => null,
      () => {}
    );
    const imgs = getLocalImages();
    const idx = imgs.findIndex((img) => img.publicId === id);
    if (idx > -1) {
      imgs[idx].categoryId = categoryId;
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(imgs));
    }
  },

  // --- Projects ---
  getProjects: async (): Promise<Project[]> => {
    return fetchWithFallback(
      "/projects",
      { method: "GET" },
      getLocalProjects,
      (data) => {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
      }
    );
  },

  saveProject: async (project: Project) => {
    const result = await fetchWithFallback(
      "/projects",
      {
        method: "POST",
        body: JSON.stringify(project),
      },
      () => project,
      () => {}
    );

    const projs = getLocalProjects();
    const idx = projs.findIndex((p) => p.id === project.id);
    if (idx > -1) projs[idx] = project;
    else projs.unshift(project);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projs));
    return result;
  },

  deleteProject: async (id: string) => {
    await fetchWithFallback(
      `/projects/${id}`,
      { method: "DELETE" },
      () => null,
      () => {}
    );
    const projs = getLocalProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projs));
  },

  // --- Auth ---
  login: async (user: string, pass: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      if (!response.ok) return false;

      const res = await response.json();
      if (!res.success || !res.token) return false;

      localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
      // Stored because the backend re-checks credentials on every privileged
      // request. There is no offline fallback: without a reachable API there
      // is nothing to authenticate against.
      localStorage.setItem(STORAGE_KEYS.AUTH, toBase64(`${user}:${pass}`));
      return true;
    } catch {
      return false;
    }
  },

  logout: clearAuth,
  isLoggedIn: () =>
    !!localStorage.getItem(STORAGE_KEYS.TOKEN) &&
    !!localStorage.getItem(STORAGE_KEYS.AUTH),
};
