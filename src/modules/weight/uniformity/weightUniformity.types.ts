export interface WeightMeasurement {
  id: number;
  flock_id: number;
  user_id: number;
  week: number;
  sex: 'female' | 'male';
  weights: number[];
  sample_count: number;
  mean_weight: number;
  std_dev: number;
  cv: number;
  uniformity: number;
  created_at: Date;
  updated_at: Date;
}

export interface WeightMeasurementRow {
  id: number;
  flock_id: number;
  user_id: number;
  week: number;
  sex: 'female' | 'male';
  weights: string;
  sample_count: number;
  mean_weight: number;
  std_dev: number;
  cv: number;
  uniformity: number;
  created_at: Date;
  updated_at: Date;
}

export interface SaveWeekDTO {
  flockId: number;
  week: number;
  sex: 'female' | 'male';
  weights: number[];
}

export interface StandardInfo {
  min_value: number;
  avg_value: number;
  max_value: number;
}

export interface WeekResponse {
  success: boolean;
  measurement: {
    flockId: number;
    week: number;
    sex: string;
    weights: number[];
    sampleCount: number;
    mean: number;
    stdDev: number;
    cv: number;
    uniformity: number;
  } | null;
  standard: StandardInfo | null;
}

export interface HistoryItem {
  week: number;
  sex: string;
  sampleCount: number;
  mean: number;
  stdDev: number;
  cv: number;
  uniformity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoryResponse {
  success: boolean;
  flockId: number;
  items: HistoryItem[];
}

export interface CalculatedStats {
  sampleCount: number;
  mean: number;
  stdDev: number;
  cv: number;
  uniformity: number;
}
