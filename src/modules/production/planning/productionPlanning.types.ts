export interface PlanningRow {
  period: string;
  weekIndex: number;
  standardWeek: number;
  hensHoused: number;
  eggs: number;
  hatchingEggs: number;
  saleableChicks: number;
  hatchingEggsCum: number;
  saleableChicksCum: number;
  hdPctProduction: number | null;
  hhPctProduction: number | null;
}

export interface PlanningExecuteResponse {
  flock: {
    id: number;
    name: string;
    hatchDate: string;
    hensHoused: number;
    productionPeriod: number;
    farmId: number | null;
  };
  product: {
    id: number;
    breed: string;
  } | null;
  startWeek: number;
  rows: PlanningRow[];
}
