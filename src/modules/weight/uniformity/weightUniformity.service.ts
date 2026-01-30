import { AppError } from "../../../middlewares/errorHandler";
import { weightUniformityLoader } from "./weightUniformity.fixtureLoader";
import {
  UniformityResponse,
  UniformityWeekResponse,
  UniformityByUuidResponse,
  UniformityLastResponse,
  UniformityWeekByUuidResponse,
} from "./weightUniformity.types";

/**
 * Service for weight uniformity operations.
 * This is a read-only beta provider using fixture data.
 */
class WeightUniformityService {
  /**
   * Get uniformity entry by userId, flockId, and productId.
   * @throws AppError 404 if not found or not owned by user
   */
  getUniformity(
    userId: string | number,
    flockId: number,
    productId: string,
  ): UniformityResponse {
    // Convert numeric userId to the string format used in fixture
    const userIdStr = this.formatUserId(userId);

    const entry = weightUniformityLoader.getByTriplet(
      userIdStr,
      flockId,
      productId,
    );

    if (!entry) {
      throw new AppError(404, "Uniformity not found");
    }

    return {
      success: true,
      uniformity: entry.uniformity,
      uniformitySetup: entry.uniformitySetup,
    };
  }

  /**
   * Get uniformity week setup by userId, flockId, productId, and week.
   * @throws AppError 404 if not found or not owned by user
   */
  getUniformityWeek(
    userId: string | number,
    flockId: number,
    productId: string,
    week: number,
  ): UniformityWeekResponse {
    const userIdStr = this.formatUserId(userId);

    const result = weightUniformityLoader.getWeekSetup(
      userIdStr,
      flockId,
      productId,
      week,
    );

    if (!result) {
      throw new AppError(404, "Uniformity or week not found");
    }

    return {
      success: true,
      uniformity: result.uniformity,
      item: result.setup,
    };
  }

  /**
   * Get uniformity entry by uuid, checking ownership.
   * @throws AppError 404 if not found or not owned by user
   */
  getUniformityByUuid(
    userId: string | number,
    uuid: string,
  ): UniformityByUuidResponse {
    const userIdStr = this.formatUserId(userId);

    const entry = weightUniformityLoader.getByUuid(uuid);

    if (!entry) {
      throw new AppError(404, "Uniformity not found");
    }

    // Check ownership - return 404 if not owned (do not leak existence)
    if (entry.uniformity.userId !== userIdStr) {
      throw new AppError(404, "Uniformity not found");
    }

    return {
      success: true,
      uniformity: entry.uniformity,
      uniformitySetup: entry.uniformitySetup,
    };
  }

  /**
   * Get the last/default uniformityUuid for the user.
   * @param userId - The user ID
   * @param productId - Optional product ID filter
   * @throws AppError 404 if not found
   */
  getLastUniformityUuid(
    userId: string | number,
    productId?: string,
  ): UniformityLastResponse {
    const userIdStr = this.formatUserId(userId);

    const uniformityUuid = weightUniformityLoader.getLastUniformityUuid(
      userIdStr,
      productId,
    );

    if (!uniformityUuid) {
      throw new AppError(404, "No uniformity found for user");
    }

    return {
      success: true,
      uniformityUuid,
    };
  }

  /**
   * Get uniformity week setup by uniformityUuid, checking ownership.
   * @throws AppError 404 if not found or not owned by user
   */
  getUniformityWeekByUuid(
    userId: string | number,
    uniformityUuid: string,
    week: number,
  ): UniformityWeekByUuidResponse {
    const userIdStr = this.formatUserId(userId);

    // First check if the entry exists
    const entry = weightUniformityLoader.getByUuid(uniformityUuid);

    if (!entry) {
      throw new AppError(404, "Uniformity not found");
    }

    // Check ownership - return 404 if not owned (do not leak existence)
    if (entry.uniformity.userId !== userIdStr) {
      throw new AppError(404, "Uniformity not found");
    }

    // Get the week setup
    const result = weightUniformityLoader.getWeekSetupByUuid(
      uniformityUuid,
      week,
    );

    if (!result) {
      throw new AppError(404, "Week not found");
    }

    return {
      success: true,
      uniformity: result.uniformity,
      item: result.setup,
    };
  }

  /**
   * Format numeric userId to match fixture format.
   * The fixture uses UUID-like string format for userId.
   * For now, we try both the numeric string and common formats.
   */
  private formatUserId(userId: string | number): string {
    // The fixture uses a specific UUID format for userId
    // We store userId as number in JWT, so we need to match appropriately
    // For beta testing, we use the numeric string representation
    return userId.toString();
  }
}

export const weightUniformityService = new WeightUniformityService();
