import type { CreateRequirementInput, RequirementResponse } from "@gopratle/contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface ApiClientError {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
    fields?: Record<string, string>;
  };
}

export async function createRequirement(
  input: CreateRequirementInput
): Promise<RequirementResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/requirements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    const error: ApiClientError = data;
    throw new Error(error.error?.message || "Failed to create requirement");
  }

  return data as RequirementResponse;
}
