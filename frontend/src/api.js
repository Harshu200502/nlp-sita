/**
 * api.js — Axios API client
 * Points to FastAPI backend. Adjust BASE_URL for production.
 */
import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // Increased from 15s → 30s to accommodate LanguageTool processing time
});

/** 
 * Request Interceptor: Attach Bearer token from localStorage
 */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response Interceptor: Handle 401 Unauthorized globally
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Authentication failed, logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      // Optional: window.location.href = "/login"; 
      // But since App.jsx React state manages logged-in status, 
      // a simple window.location.reload() or force state update is better.
      window.location.reload(); 
    }
    return Promise.reject(error);
  }
);

export { API };

/** Login */
export async function loginDemo(username, password) {
  const { data } = await API.post("/login", { username, password });
  return data;
}

/** Analyze a single instruction */
export async function analyzeText(text, user_type = "Professional") {
  const { data } = await API.post("/analyze", { text, user_type });
  return data;
}

/** Analyze a batch of instructions (up to 20) */
export async function analyzeBatch(texts) {
  const { data } = await API.post("/batch", { texts });
  return data;
}

/** Health check */
export async function healthCheck() {
  const { data } = await API.get("/health");
  return data;
}

/** Get full abbreviation dictionary */
export async function getAbbreviations() {
  const { data } = await API.get("/abbreviations");
  return data;
}

/** Build a smart prompt out of text */
export async function buildPrompt(text, user_type, task_type) {
  const { data } = await API.post("/build_prompt", {
    text,
    user_type,
    task_type,
  });
  return data;
}

/** Improve research writing */
export async function improveWriting(text) {
  const { data } = await API.post("/improve-writing", { text });
  return data;
}
