import { apiRequest } from "./queryClient";
import { 
  DebatePoint, 
  DebateTopicRequest, 
  RebuttalRequest, 
  CounterArgumentRequest,
  Debate
} from "./types";

// Generate debate points for a topic with specified options
export async function generateDebatePoints(request: DebateTopicRequest): Promise<DebatePoint> {
  const res = await apiRequest("POST", "/api/debate", request);
  return res.json();
}

// Generate additional rebuttals for a specific side of a debate
export async function generateRebuttals(request: RebuttalRequest): Promise<string[]> {
  const res = await apiRequest("POST", "/api/rebuttals", request);
  const data = await res.json();
  return data.rebuttals;
}

// Generate counter-arguments against a specific argument
export async function generateCounterArguments(request: CounterArgumentRequest): Promise<string[]> {
  const res = await apiRequest("POST", "/api/counter-arguments", request);
  const data = await res.json();
  return data.counterArguments;
}

// Save a new debate
export async function saveDebate(debate: Omit<Debate, "id" | "createdAt">): Promise<Debate> {
  const res = await apiRequest("POST", "/api/debates", debate);
  return res.json();
}

// Get all debates, filtered by user ID if provided
export async function getDebates(userId?: number): Promise<Debate[]> {
  const queryParam = userId ? `?userId=${userId}` : '';
  const res = await apiRequest("GET", `/api/debates${queryParam}`);
  return res.json();
}

// Get a specific debate by ID
export async function getDebate(id: number): Promise<Debate> {
  const res = await apiRequest("GET", `/api/debates/${id}`);
  return res.json();
}

// Delete a debate by ID
export async function deleteDebate(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/debates/${id}`);
}

// Search debates by topic query
export async function searchDebates(query: string): Promise<Debate[]> {
  const res = await apiRequest("GET", `/api/debates/search?q=${encodeURIComponent(query)}`);
  return res.json();
}
