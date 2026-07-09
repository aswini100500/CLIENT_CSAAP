import axios from "axios";

const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;
const TODOS_URL = `${API_BASE}/api/todos`;

export const fetchTodos = async (params) => {
  const { data } = await axios.get(TODOS_URL, { params });
  return data;
};

export const createTodo = async (payload) => {
  const { data } = await axios.post(TODOS_URL, payload);
  return data;
};

export const updateTodo = async (id, payload) => {
  const { data } = await axios.put(`${TODOS_URL}/${id}`, payload);
  return data;
};

export const deleteTodo = async (id, createdBy) => {
  const { data } = await axios.delete(`${TODOS_URL}/${id}`, {
    params: { created_by: createdBy },
  });
  return data;
};

export const toggleTodoStatus = async (id, createdBy) => {
  const { data } = await axios.put(`${TODOS_URL}/${id}/toggle-status`, {
    created_by: createdBy,
  });
  return data;
};

export const toggleTodoArchive = async (id, createdBy) => {
  const { data } = await axios.put(`${TODOS_URL}/${id}/archive`, {
    created_by: createdBy,
  });
  return data;
};
