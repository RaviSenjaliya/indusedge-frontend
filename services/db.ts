import { Product, Category, Inquiry, InquiryStatus } from "../types";
import { PRODUCTS, CATEGORIES } from "../constants";

const API_BASE_URL = "http://localhost:5001/api";
const STORAGE_KEYS = {
  PRODUCTS: "indusedge_products_v1",
  CATEGORIES: "indusedge_categories_v1",
  INQUIRIES: "indusedge_inquiries_v1",
  NOTIFICATIONS: "indusedge_notif_history",
  IMAGES: "indusedge_images_v1",
  TOKEN: "indusedge_token",
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
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // On success, sync back to local storage
    if (options.method === "GET" && Array.isArray(data)) {
      localSetter(data as T);
    }

    return data as T;
  } catch (err) {
    console.warn(
      `[IndusEdge Resilience] API unreachable at ${endpoint}. Using Local Node.`
    );
    return localGetter();
  }
};

const getLocalProducts = (): Product[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]");
const getLocalCategories = (): Category[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
const getLocalInquiries = (): Inquiry[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || "[]");
const getLocalNotifications = (): any[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]");
const getLocalImages = (): any[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.IMAGES) || "[]");

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
      email: formData.email || "not-provided@example.com",
      phone: formData.phone,
      company: formData.company || "Private Buyer",
      message: formData.message || "No specific requirements provided.",
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
    inqs.push(newInquiry);
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

  // --- Notifications ---
  getNotifications: async (): Promise<any[]> => {
    return fetchWithFallback(
      "/notifications",
      { method: "GET" },
      getLocalNotifications,
      (data) => {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data));
      }
    );
  },

  broadcastNotification: async (
    title: string,
    body: string,
    iconUrl?: string
  ) => {
    const payload = { title, body, icon: iconUrl };
    const result = await fetchWithFallback(
      "/notifications",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      () => ({
        ...payload,
        id: "local_" + Date.now(),
        sentAt: new Date().toISOString(),
      }),
      () => {}
    );

    const history = getLocalNotifications();
    history.unshift(result);
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(history.slice(0, 10))
    );
    return result;
  },

  deleteNotification: async (id: string) => {
    await fetchWithFallback(
      `/notifications/${id}`,
      { method: "DELETE" },
      () => null,
      () => {}
    );
    const history = getLocalNotifications().filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(history));
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
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Upload failed");
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

  // --- Auth ---
  login: async (user: string, pass: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      const res = await response.json();
      if (res.success && res.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
        return true;
      }
      return false;
    } catch {
      if (user === "admin" && pass === "password123") {
        localStorage.setItem(STORAGE_KEYS.TOKEN, "demo-offline-session");
        return true;
      }
      return false;
    }
  },

  logout: () => localStorage.removeItem(STORAGE_KEYS.TOKEN),
  isLoggedIn: () => !!localStorage.getItem(STORAGE_KEYS.TOKEN),
};
