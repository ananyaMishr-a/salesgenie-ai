import { apiClient } from "./client";

/**
 * Milestone 4: Dashboard & Analytics Services
 */

export async function fetchDashboardOverview() {
  const data = await apiClient.get("/dashboard/overview");
  return data;
}

export async function fetchDashboardKPIs() {
  const data = await apiClient.get("/dashboard/kpis");
  return data;
}

export async function fetchDashboardPipeline() {
  const data = await apiClient.get("/dashboard/pipeline");
  return data;
}

export async function fetchDashboardRecommendations() {
  const data = await apiClient.get("/dashboard/recommendations");
  return data;
}

export async function fetchTopLeads(limit = 5) {
  const data = await apiClient.get(`/dashboard/top-leads?limit=${limit}`);
  return data;
}
