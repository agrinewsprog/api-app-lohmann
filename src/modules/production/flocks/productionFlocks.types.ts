export interface ProductionFlock {
  id: number;
  user_id: number;
  farm_id: number | null;
  name: string;
  flock_number: string | null;
  hatch_date: Date | null;
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

export interface ProductionFlockWithFarm extends ProductionFlock {
  farm_name: string | null;
}

export interface ProductionFlockResponse {
  id: number;
  name: string;
  flockNumber: string | null;
  hatchDate: string | null;
  hensHoused: number;
  productionPeriod: number;
  productId: string | null;
  location: string | null;
  notes: string | null;
  farm: {
    id: number;
    name: string;
  } | null;
  advancedSettings: {
    initialMortalityPct: number | null;
    eggsPct: number | null;
    hatchingEggsPct: number | null;
    chicksPct: number | null;
  };
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductionFlockDTO {
  farmId?: number;
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

export interface UpdateProductionFlockDTO {
  farmId?: number;
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

import { formatLocalDate } from '../../../utils/date';

export function sanitizeProductionFlock(flock: ProductionFlockWithFarm): ProductionFlockResponse {
  return {
    id: flock.id,
    name: flock.name,
    flockNumber: flock.flock_number,
    hatchDate: formatLocalDate(flock.hatch_date),
    hensHoused: flock.hens_housed,
    productionPeriod: flock.production_period,
    productId: flock.product_id,
    location: flock.location,
    notes: flock.notes,
    farm: flock.farm_id && flock.farm_name ? {
      id: flock.farm_id,
      name: flock.farm_name,
    } : null,
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
