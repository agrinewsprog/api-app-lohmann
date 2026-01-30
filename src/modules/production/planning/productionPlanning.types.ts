export interface PlanningRow {
  period: string;
  weekIndex: number;
  hensHoused: number;
  eggs: number;
}

export interface PlanningExecuteResponse {
  flock: {
    id: number;
    name: string;
    hatchDate: string;
    hensHoused: number;
    productionPeriod: number;
  };
  product: {
    id: string;
    name: string;
  } | null;
  rows: PlanningRow[];
}
