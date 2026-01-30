-- Migration: Create standards_products table
-- Description: Stores normalized product catalog (Breed + Color combinations)

CREATE TABLE IF NOT EXISTS standards_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    breed VARCHAR(150) NOT NULL,
    color VARCHAR(80) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_breed_color (breed, color),
    INDEX idx_breed (breed),
    INDEX idx_color (color)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
