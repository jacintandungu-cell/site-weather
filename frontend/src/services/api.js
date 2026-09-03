const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, options);
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
