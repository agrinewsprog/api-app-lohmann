-- Migration: Alter standards_growth table to add production standards columns
-- Description: Adds columns for all production metrics from CSV standards-2.csv
-- Maintains compatibility with existing weight data (min_value, avg_value, max_value)
-- Uses DOUBLE to preserve exact decimal precision from CSV (no trailing zeros)

-- Add new columns for production standards
ALTER TABLE standards_growth
    ADD COLUMN livability DOUBLE NULL AFTER max_value,
    ADD COLUMN hh_pct_production DOUBLE NULL AFTER livability,
    ADD COLUMN min_hd_pct_production DOUBLE NULL AFTER hh_pct_production,
    ADD COLUMN hd_pct_production DOUBLE NULL AFTER min_hd_pct_production,
    ADD COLUMN max_hd_pct_production DOUBLE NULL AFTER hd_pct_production,
    ADD COLUMN ehh_week DOUBLE NULL AFTER max_hd_pct_production,
    ADD COLUMN ehh_cum DOUBLE NULL AFTER ehh_week,
    ADD COLUMN pct_hatching_eggs DOUBLE NULL AFTER ehh_cum,
    ADD COLUMN he_week DOUBLE NULL AFTER pct_hatching_eggs,
    ADD COLUMN he_cum DOUBLE NULL AFTER he_week,
    ADD COLUMN total_pct_hatch DOUBLE NULL AFTER he_cum,
    ADD COLUMN saleable_pct_hatch DOUBLE NULL AFTER total_pct_hatch,
    ADD COLUMN saleable_chicks_week DOUBLE NULL AFTER saleable_pct_hatch,
    ADD COLUMN saleable_chicks_cum DOUBLE NULL AFTER saleable_chicks_week,
    ADD COLUMN egg_weight_week DOUBLE NULL AFTER saleable_chicks_cum;

-- Note: UNIQUE KEY on (product_id, week, sex) already exists from original migration (uniq_growth)
