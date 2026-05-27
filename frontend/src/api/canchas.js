import { api } from "./client";

export const canchasAPI = {
  listar: () => api.get("/canchas"),
  crear: (data) => api.post("/canchas", data),
};
