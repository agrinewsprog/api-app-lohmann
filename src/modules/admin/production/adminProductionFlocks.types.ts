export interface ProductionFlock {
  id: number;
  user_id: number;
  name: string;
  location: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminProductionFlockResponse {
  id: number;
  user_id: number;
  name: string;
  location: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminCreateProductionFlockDTO {
  userId: number;
  name: string;
  location?: string;
  notes?: string;
}

export interface AdminUpdateProductionFlockDTO {
  name?: string;
  location?: string;
  notes?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedProductionFlocksResponse {
  items: AdminProductionFlockResponse[];
  meta: PaginationMeta;
}

export function sanitizeAdminProductionFlock(flock: ProductionFlock): AdminProductionFlockResponse {
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
