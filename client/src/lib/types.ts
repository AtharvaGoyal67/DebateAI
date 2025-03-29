export interface Evidence {
  point: string;
  sources: string[];
}

export interface DebatePoint {
  proposition: string[];
  opposition: string[];
  propositionRebuttals: string[];
  oppositionRebuttals: string[];
  evidence: Evidence[];
  language?: string;
}

export interface DebateTopicRequest {
  topic: string;
  language?: string;
  complexity?: string;
}

export interface RebuttalRequest {
  topic: string;
  side: "proposition" | "opposition";
  count?: number;
}

export interface CounterArgumentRequest {
  argument: string;
  topic?: string;
  count?: number;
}

export interface Debate {
  id: number;
  topic: string;
  points: DebatePoint;
  userId: number | null;
  language: string | null;
  createdAt: Date | null;
}
