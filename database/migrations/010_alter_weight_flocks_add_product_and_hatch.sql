-- Migration: Alter weight_flocks — add product_id and hatch_date
-- Description: Associates a flock with a breed/product for standard lookups, and stores hatch date

ALTER TABLE weight_flocks
  ADD COLUMN product_id INT NULL AFTER notes,
  ADD COLUMN hatch_date DATE NULL AFTER product_id,
  ADD CONSTRAINT fk_weight_flocks_product FOREIGN KEY (product_id) REFERENCES standards_products(id) ON DELETE SET NULL;
