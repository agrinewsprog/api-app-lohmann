import { AdminProductionRecordsRepository } from "./adminProductionRecords.repository";

const repository = new AdminProductionRecordsRepository();

export class AdminProductionRecordsService {
  async getByFlock(flockId: number) {
    const items = await repository.getByFlock(flockId);

    return {
      success: true,
      items,
    };
  }
}
