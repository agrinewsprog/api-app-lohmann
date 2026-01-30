-- Migration: Alter production_flocks table
-- Description: Add farm relationship and production planning fields

-- Add new columns (only if they don't exist)
ALTER TABLE production_flocks
    ADD COLUMN IF NOT EXISTS farm_id BIGINT NULL AFTER user_id,
    ADD COLUMN IF NOT EXISTS flock_number VARCHAR(50) NULL AFTER name,
    ADD COLUMN IF NOT EXISTS hatch_date DATE NULL AFTER flock_number,
    ADD COLUMN IF NOT EXISTS hens_housed INT NOT NULL DEFAULT 0 AFTER hatch_date,
    ADD COLUMN IF NOT EXISTS production_period INT NOT NULL DEFAULT 72 AFTER hens_housed,
    ADD COLUMN IF NOT EXISTS product_id CHAR(36) NULL AFTER production_period;

-- Add indexes (drop first if they exist to avoid errors)
ALTER TABLE production_flocks
    ADD INDEX IF NOT EXISTS idx_prod_flocks_farm (farm_id),
    ADD INDEX IF NOT EXISTS idx_prod_flocks_user_farm (user_id, farm_id),
    ADD INDEX IF NOT EXISTS idx_prod_flocks_product (product_id);

-- Add foreign key constraint (only if it doesn't exist)
-- Note: MySQL doesn't support IF NOT EXISTS for foreign keys, so we handle it with a procedure
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'production_flocks' 
    AND CONSTRAINT_NAME = 'fk_prod_flocks_farm'
);

SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE production_flocks ADD CONSTRAINT fk_prod_flocks_farm FOREIGN KEY (farm_id) REFERENCES production_farms(id) ON DELETE SET NULL',
    'SELECT "Foreign key already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
