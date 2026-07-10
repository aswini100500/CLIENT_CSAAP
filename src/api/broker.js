import client from "./client";

export const getBrokers = () =>
  client.get("/api/tenant/brokers").then((r) => r.data);
export const createBroker = (data) => client.post("/api/tenant/brokers", data);
export const updateBroker = (id, data) =>
  client.put(`/api/tenant/brokers/${id}`, data);
export const deleteBroker = (id) => client.delete(`/api/tenant/brokers/${id}`);
export const getBrokerById = (id) =>
  client.get(`/api/tenant/brokers/${id}`).then((r) => r.data);
