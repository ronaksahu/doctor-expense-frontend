// src/utils/apiFetch.js
// A wrapper for fetch that redirects to login on 401/403 for all API calls except register & signIn

export async function apiFetch(url, options = {}) {
  // Only skip redirect for register and signIn endpoints
  const skipRedirect =
    url.includes('/auth/doctor/signin') || url.includes('/auth/doctor/register');

  const response = await fetch(url, options);
  if (!skipRedirect && (response.status === 401 || response.status === 403)) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/");
    return Promise.reject(new Error("Unauthorized. Redirecting to login."));
  }
  return response;
}
