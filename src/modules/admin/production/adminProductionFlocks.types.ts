export interface ProductionFlock {
  id: number;
  user_id: number;
  name: string;
  flock_number: string | null;
  hatch_date: string | null;
  hens_housed: number;
  production_period: number;
  product_id: string | null;
  location: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminProductionFlockResponse {
  id: number;
  user_id: number;
  name: string;
  flockNumber: string | null;
  hatchDate: string | null;
  hensHoused: number;
  productionPeriod: number;
  productId: string | null;
  location: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminCreateProductionFlockDTO {
  userId: number;
  name: string;
  flockNumber?: string;
  hatchDate?: string;
  hensHoused?: number;
  productionPeriod?: number;
  productId?: string;
  location?: string;
  notes?: string;
}

export interface AdminUpdateProductionFlockDTO {
  name?: string;
  flockNumber?: string;
  hatchDate?: string;
  hensHoused?: number;
  productionPeriod?: number;
  productId?: string;
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
    flockNumber: flock.flock_number,
    hatchDate: flock.hatch_date ? String(flock.hatch_date).substring(0, 10) : null,
    hensHoused: Number(flock.hens_housed),
    productionPeriod: Number(flock.production_period),
    productId: flock.product_id,
    location: flock.location,
    notes: flock.notes,
    created_at: flock.created_at,
    updated_at: flock.updated_at,
  };
}
