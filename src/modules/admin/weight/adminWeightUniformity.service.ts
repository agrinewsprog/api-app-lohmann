import { AdminWeightUniformityRepository } from "./adminWeightUniformity.repository";
import { AdminWeightFlocksRepository } from "./adminWeightFlocks.repository";
import { AppError } from "../../../middlewares/errorHandler";

const repository = new AdminWeightUniformityRepository();
const flocksRepository = new AdminWeightFlocksRepository();

export class AdminWeightUniformityService {
  async getHistory(flockId: number, sex?: "female" | "male") {
    const items = await repository.getHistory(flockId, sex);

    return {
      success: true,
      items,
    };
  }

  async getWeek(flockId: number, week: number, sex: "female" | "male") {
    const item = await repository.getWeek(flockId, week, sex);

    if (!item) {
      return {
        success: true,
        item: null,
        message: "No data found for this week",
      };
    }

    return {
      success: true,
      item,
    };
  }

  async saveWeek(
    flockId: number,
    week: number,
    sex: "female" | "male",
    weights: number[],
  ) {
    const flock = await flocksRepository.findById(flockId);
    if (!flock) {
      throw new AppError(404, "Flock not found");
    }

    const stats = this.calculateStats(weights);

    const item = await repository.saveWeek(
      flockId,
      flock.user_id,
      week,
      sex,
      weights,
      stats.sampleCount,
      stats.mean,
      stats.stdDev,
      stats.cv,
      stats.uniformity,
    );

    return {
      success: true,
      item,
    };
  }

  private calculateStats(weights: number[]) {
    const sampleCount = weights.length;
    const sum = weights.reduce((a, b) => a + b, 0);
    const mean = sum / sampleCount;

    const variance =
      weights.reduce((acc, w) => acc + (w - mean) ** 2, 0) / sampleCount;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

    const lower = mean * 0.9;
    const upper = mean * 1.1;
    const withinRange = weights.filter((w) => w >= lower && w <= upper).length;
    const uniformity = (withinRange / sampleCount) * 100;

    return {
      sampleCount,
      mean: Math.round(mean * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      cv: Math.round(cv * 100) / 100,
      uniformity: Math.round(uniformity * 100) / 100,
    };
  }
}
