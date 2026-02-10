import { WeightUniformityRepository } from './weightUniformity.repository';
import { WeightFlocksRepository } from '../flocks/weightFlocks.repository';
import { StandardsRepository } from '../../standards/standards.repository';
import { AppError } from '../../../middlewares/errorHandler';
import {
  SaveWeekDTO,
  WeekResponse,
  HistoryResponse,
  CalculatedStats,
  StandardInfo,
  WeightMeasurementRow,
} from './weightUniformity.types';

export class WeightUniformityService {
  private repository: WeightUniformityRepository;
  private flocksRepository: WeightFlocksRepository;
  private standardsRepository: StandardsRepository;

  constructor() {
    this.repository = new WeightUniformityRepository();
    this.flocksRepository = new WeightFlocksRepository();
    this.standardsRepository = new StandardsRepository();
  }

  async saveWeek(userId: number, dto: SaveWeekDTO): Promise<WeekResponse> {
    const flock = await this.flocksRepository.findByIdAndUserId(dto.flockId, userId);
    if (!flock) {
      throw new AppError(404, 'Flock not found');
    }

    const stats = this.calculateStats(dto.weights);

    const row = await this.repository.upsert(
      dto.flockId,
      userId,
      dto.week,
      dto.sex,
      dto.weights,
      stats.sampleCount,
      stats.mean,
      stats.stdDev,
      stats.cv,
      stats.uniformity,
    );

    const standard = await this.fetchStandard(flock.product_id, dto.week, dto.sex);

    return {
      success: true,
      measurement: this.formatMeasurement(row),
      standard,
    };
  }

  async getWeek(
    userId: number,
    flockId: number,
    week: number,
    sex: 'female' | 'male',
  ): Promise<WeekResponse> {
    const flock = await this.flocksRepository.findByIdAndUserId(flockId, userId);
    if (!flock) {
      throw new AppError(404, 'Flock not found');
    }

    const row = await this.repository.findByFlockWeekSex(flockId, week, sex);
    const standard = await this.fetchStandard(flock.product_id, week, sex);

    return {
      success: true,
      measurement: row ? this.formatMeasurement(row) : null,
      standard,
    };
  }

  async getHistory(
    userId: number,
    flockId: number,
    sex?: 'female' | 'male',
  ): Promise<HistoryResponse> {
    const flock = await this.flocksRepository.findByIdAndUserId(flockId, userId);
    if (!flock) {
      throw new AppError(404, 'Flock not found');
    }

    const rows = sex
      ? await this.repository.findAllByFlockIdAndSex(flockId, sex)
      : await this.repository.findAllByFlockId(flockId);

    return {
      success: true,
      flockId,
      items: rows.map((row) => ({
        week: row.week,
        sex: row.sex,
        sampleCount: row.sample_count,
        mean: Number(row.mean_weight),
        stdDev: Number(row.std_dev),
        cv: Number(row.cv),
        uniformity: Number(row.uniformity),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    };
  }

  calculateStats(weights: number[]): CalculatedStats {
    const sampleCount = weights.length;
    const sum = weights.reduce((a, b) => a + b, 0);
    const mean = sum / sampleCount;

    const squaredDiffs = weights.map((w) => (w - mean) ** 2);
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / sampleCount;
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

  private async fetchStandard(
    productId: number | null,
    week: number,
    sex: 'female' | 'male',
  ): Promise<StandardInfo | null> {
    if (!productId) return null;

    const growth = await this.standardsRepository.findGrowthByProductAndWeekAndSex(
      productId,
      week,
      sex,
    );

    if (!growth) return null;

    return {
      min_value: Number(growth.min_value),
      avg_value: Number(growth.avg_value),
      max_value: Number(growth.max_value),
    };
  }

  private formatMeasurement(row: WeightMeasurementRow) {
    const weights = typeof row.weights === 'string' ? JSON.parse(row.weights) : row.weights;
    return {
      flockId: row.flock_id,
      week: row.week,
      sex: row.sex,
      weights,
      sampleCount: row.sample_count,
      mean: Number(row.mean_weight),
      stdDev: Number(row.std_dev),
      cv: Number(row.cv),
      uniformity: Number(row.uniformity),
    };
  }
}
