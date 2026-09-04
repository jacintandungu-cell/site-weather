const configuredApiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "");
const API_URL = normalizedApiUrl.endsWith("/api") ? normalizedApiUrl : `${normalizedApiUrl}/api`;

export async function getApiStatus() {
  const response = await fetch(`${normalizedApiUrl}/`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "API unavailable");
  return body;
}

async function request(path, options) {
  const token = localStorage.getItem("siteweather_token");
  const headers = { ...(options && options.headers), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Request failed");
  return body;
}

export async function getTasks() {
  return request("/tasks");
}

export async function createTask(task) {
  return request("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

export async function updateTask(id, task) {
  return request(`/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

export async function deleteTask(id) {
  return request(`/tasks/${id}`, { method: "DELETE" });
}

export async function getUsers() {
  return request("/users");
}

export async function createUser(user) {
  return request("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

export async function login(credentials) {
  return request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export async function requestPasswordReset(email) {
  return request("/auth/request-password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(credentials) {
  return request("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export async function updateUser(id, user) {
  return request(`/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: "DELETE" });
}
