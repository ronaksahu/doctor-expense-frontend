// src/utils/apiFetch.js
// A wrapper for fetch that redirects to login on 401/403 for all API calls except register & signIn

import { dbPromise } from "./db";
import { fullDataLoad } from "./fullDataLoad";

export async function apiFetch(url, options = {}, { store, method, data } = {}) {
  // Only skip redirect for register and signIn endpoints
  const skipRedirect =
    url.includes('/auth/doctor/signin') || url.includes('/auth/doctor/register');

  // Always use token from localStorage for persistence
  const token = localStorage.getItem("doctor_token");
  if (token && (!options.headers || !options.headers["Authorization"])) {
    options.headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }

  if (navigator.onLine) {
    // Online: normal fetch, update cache
    const response = await fetch(url, options);
    if (response.ok && store) {
      const result = await response.clone().json();
      const db = await dbPromise;
      if (Array.isArray(result[store])) {
        for (const item of result[store]) {
          await db.put(store, item);
        }
      }
    }
    // After any mutation (not GET), refresh all cache from backend
    if (["POST", "PUT", "DELETE"].includes(method)) {
      try { await fullDataLoad(); } catch {}
    }
    if (!skipRedirect && (response.status === 401 || response.status === 403)) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/");
      return Promise.reject(new Error("Unauthorized. Redirecting to login."));
    }
    return response;
  } else {
    // Offline: read from cache or queue mutation
    const db = await dbPromise;
    if (method === 'GET' && store) {
      const all = await db.getAll(store);
      // Return a fetch-like Response object for compatibility
      const a = {
        ok: true,
        status: 200,
        json: async () => ({ [store]: all }),
        // Add text() for compatibility if needed
        text: async () => JSON.stringify({ [store]: all }),
      }
      return a;
    } else if (["POST", "PUT", "DELETE"].includes(method)) {
      await db.add("queue", { url, options, store, method, data });
      // Update local cache immediately for POST/PUT/DELETE
      if (store && data) {
        let value = data;
        if (method === "POST" && !value.id) {
          value = { ...data, id: Date.now() }; // assign temp id if not present
        }
        await db.put(store, value);
      }
      return { ok: true, json: async () => ({ success: true, offline: true }) };
    }
  }
}
