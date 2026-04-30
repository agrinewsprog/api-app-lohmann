export interface ProductionFlock {
  id: number;
  user_id: number;
  name: string;
  flock_number: string | null;
  hatch_date: Date | string | null;
  hens_housed: number;
  production_period: number;
  product_id: string | null;
  location: string | null;
  notes: string | null;
  initial_mortality_pct: number | null;
  eggs_pct: number | null;
  hatching_eggs_pct: number | null;
  chicks_pct: number | null;
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
  advancedSettings: {
    initialMortalityPct: number | null;
    eggsPct: number | null;
    hatchingEggsPct: number | null;
    chicksPct: number | null;
  };
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
  initialMortalityPct?: number;
  eggsPct?: number;
  hatchingEggsPct?: number;
  chicksPct?: number;
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
  initialMortalityPct?: number | null;
  eggsPct?: number | null;
  hatchingEggsPct?: number | null;
  chicksPct?: number | null;
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

import { formatLocalDate } from '../../../utils/date';

export function sanitizeAdminProductionFlock(flock: ProductionFlock): AdminProductionFlockResponse {
  return {
    id: flock.id,
    user_id: flock.user_id,
    name: flock.name,
    flockNumber: flock.flock_number,
    hatchDate: formatLocalDate(flock.hatch_date),
    hensHoused: Number(flock.hens_housed),
    productionPeriod: Number(flock.production_period),
    productId: flock.product_id,
    location: flock.location,
    notes: flock.notes,
    advancedSettings: {
      initialMortalityPct: flock.initial_mortality_pct,
      eggsPct: flock.eggs_pct,
      hatchingEggsPct: flock.hatching_eggs_pct,
      chicksPct: flock.chicks_pct,
    },
    created_at: flock.created_at,
    updated_at: flock.updated_at,
  };
}
