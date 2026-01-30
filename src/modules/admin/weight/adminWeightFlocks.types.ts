export interface WeightFlock {
  id: number;
  user_id: number;
  name: string;
  location: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminWeightFlockResponse {
  id: number;
  user_id: number;
  name: string;
  location: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminCreateWeightFlockDTO {
  userId: number;
  name: string;
  location?: string;
  notes?: string;
}

export interface AdminUpdateWeightFlockDTO {
  name?: string;
  location?: string;
  notes?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedWeightFlocksResponse {
  items: AdminWeightFlockResponse[];
  meta: PaginationMeta;
}

export function sanitizeAdminWeightFlock(flock: WeightFlock): AdminWeightFlockResponse {
  return {
    id: flock.id,
    user_id: flock.user_id,
    name: flock.name,
    location: flock.location,
    notes: flock.notes,
    created_at: flock.created_at,
    updated_at: flock.updated_at,
  };
}
