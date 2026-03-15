import type {
  CreateIdentityRequest,
  CreateIdentityResponse,
  FilecoinIdentity,
  CalculateReputationRequest,
  CalculateReputationResponse,
  FilecoinHistory,
  FilecoinProof,
  RegisterAgentRequest,
  RegisterAgentResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API request failed: ${res.status}`);
  }

  return res.json();
}

export function createIdentity(data: CreateIdentityRequest): Promise<CreateIdentityResponse> {
  return request("/identity/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getIdentity(cid: string): Promise<FilecoinIdentity> {
  return request(`/identity/${encodeURIComponent(cid)}`);
}

export function calculateReputation(data: CalculateReputationRequest): Promise<CalculateReputationResponse> {
  return request("/reputation/calculate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getHistory(cid: string): Promise<FilecoinHistory> {
  return request(`/history/${encodeURIComponent(cid)}`);
}

export function getProof(cid: string): Promise<FilecoinProof> {
  return request(`/proof/${encodeURIComponent(cid)}`);
}

export function registerAgent(data: RegisterAgentRequest): Promise<RegisterAgentResponse> {
  return request("/agent/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
