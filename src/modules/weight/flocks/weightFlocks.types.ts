export interface WeightFlock {
  id: number;
  user_id: number;
  name: string;
  location: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface WeightFlockResponse {
  id: number;
  name: string;
  location: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWeightFlockDTO {
  name: string;
  location?: string;
  notes?: string;
}

export interface UpdateWeightFlockDTO {
  name?: string;
  location?: string;
  notes?: string;
}

export function sanitizeWeightFlock(flock: WeightFlock): WeightFlockResponse {
  return {
    id: flock.id,
    name: flock.name,
    location: flock.location,
    notes: flock.notes,
    created_at: flock.created_at,
    updated_at: flock.updated_at,
  };
}
