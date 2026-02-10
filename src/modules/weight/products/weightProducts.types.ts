export interface WeightProductResponse {
  id: number;
  breed: string;
  color: string;
  image: string;
}

export interface WeightGrowthStandard {
  week: number;
  sex: 'female' | 'male';
  min_value: number;
  avg_value: number;
  max_value: number;
}

export interface ProductDetailResponse {
  product: WeightProductResponse;
  standards: WeightGrowthStandard[];
}
