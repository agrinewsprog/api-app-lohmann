export interface CreateStandardWeekDTO {
  productId: number;
  week: number;
  sex: "female" | "male";
  min: number;
  avg: number;
  max: number;
}

export interface UpdateStandardWeekDTO {
  min?: number;
  avg?: number;
  max?: number;
}

export interface StandardWeekResponse {
  id: number;
  productId: number;
  week: number;
  sex: "female" | "male";
  min: number;
  avg: number;
  max: number;
  createdAt: Date;
  updatedAt: Date;
}
