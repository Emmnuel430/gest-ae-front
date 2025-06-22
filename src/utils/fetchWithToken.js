export async function fetchWithToken(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const finalOptions = {
    ...options,
    headers,
    credentials: "include",
  };

  const response = await fetch(url, finalOptions);

  // Si le token est invalide ou expiré
  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "/";
    throw new Error("Non autorisé");
  }

  return response;
}
