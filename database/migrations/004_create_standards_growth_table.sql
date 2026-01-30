-- Migration: Create standards_growth table
-- Description: Stores growth standards (Body Weight) per product, week, and sex

CREATE TABLE IF NOT EXISTS standards_growth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    week INT NOT NULL,
    sex ENUM('female', 'male') NOT NULL,
    min_value DECIMAL(10,2) NOT NULL,
    avg_value DECIMAL(10,2) NOT NULL,
    max_value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_growth (product_id, week, sex),
    FOREIGN KEY (product_id) REFERENCES standards_products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_week (week),
    INDEX idx_sex (sex),
    INDEX idx_product_week (product_id, week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
