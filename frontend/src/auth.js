export function setToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function isAuthenticated() {
  return !!getToken();
}

export function clearToken() {
  localStorage.removeItem("token");
}

export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    return Promise.reject(new Error("Unauthorized - token expired or invalid"));
  }

  return res;
}
