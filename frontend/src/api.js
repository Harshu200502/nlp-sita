/**
 * api.js — Axios API client
 * Points to FastAPI backend. Adjust BASE_URL for production.
 */
import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/** Analyze a single instruction */
export async function analyzeText(text) {
  const { data } = await client.post("/analyze", { text });
  return data;
}

/** Analyze a batch of instructions (up to 20) */
export async function analyzeBatch(texts) {
  const { data } = await client.post("/batch", { texts });
  return data;
}

/** Health check */
export async function healthCheck() {
  const { data } = await client.get("/health");
  return data;
}

/** Get full abbreviation dictionary */
export async function getAbbreviations() {
  const { data } = await client.get("/abbreviations");
  return data;
}

/** Build a smart prompt out of text */
export async function buildPrompt(text, user_type, task_type) {
  const { data } = await client.post("/build_prompt", {
    text,
    user_type,
    task_type,
  });
  return data;
}
