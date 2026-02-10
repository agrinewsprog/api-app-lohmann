export interface WeightFlock {
  id: number;
  user_id: number;
  name: string;
  location: string | null;
  notes: string | null;
  product_id: number | null;
  hatch_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface WeightFlockResponse {
  id: number;
  name: string;
  location: string | null;
  notes: string | null;
  product_id: number | null;
  hatch_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWeightFlockDTO {
  name: string;
  location?: string;
  notes?: string;
  productId?: number;
  hatchDate?: string;
}

export interface UpdateWeightFlockDTO {
  name?: string;
  location?: string;
  notes?: string;
  productId?: number | null;
  hatchDate?: string | null;
}

export function sanitizeWeightFlock(flock: WeightFlock): WeightFlockResponse {
  return {
    id: flock.id,
    name: flock.name,
    location: flock.location,
    notes: flock.notes,
    product_id: flock.product_id,
    hatch_date: flock.hatch_date,
    created_at: flock.created_at,
    updated_at: flock.updated_at,
  };
}
