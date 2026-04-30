ALTER TABLE production_flocks
  ADD COLUMN initial_mortality_pct DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Flat mortality % applied once to hens housed. NULL = no adjustment.',
  ADD COLUMN eggs_pct              DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Egg production multiplier vs breed standard (e.g. 95 = 95%). NULL = 100%.',
  ADD COLUMN hatching_eggs_pct     DECIMAL(5,2) NULL DEFAULT NULL COMMENT '% of total eggs set for hatching. NULL = use per-week standard curve.',
  ADD COLUMN chicks_pct            DECIMAL(5,2) NULL DEFAULT NULL COMMENT '% of hatching eggs that become saleable chicks. NULL = use per-week standard curve.';
