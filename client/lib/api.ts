import xior from "xior";

const api = xior.create({
  baseURL: "https://health-pilot-server.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in the Authorization header
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  return config;
});

export default api;
