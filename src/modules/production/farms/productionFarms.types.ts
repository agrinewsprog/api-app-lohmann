export interface ProductionFarm {
  id: number;
  user_id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductionFarmResponse {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductionFarmDTO {
  name: string;
}

export interface UpdateProductionFarmDTO {
  name?: string;
}

export function sanitizeProductionFarm(farm: ProductionFarm): ProductionFarmResponse {
  return {
    id: farm.id,
    name: farm.name,
    created_at: farm.created_at,
    updated_at: farm.updated_at,
  };
}
