-- Migration: Create weight_measurements table
-- Description: Stores per-week weight samples and calculated stats for each flock

CREATE TABLE IF NOT EXISTS weight_measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flock_id INT NOT NULL,
    user_id INT NOT NULL,
    week INT NOT NULL,
    sex ENUM('female','male') NOT NULL,
    weights JSON NOT NULL,
    sample_count INT NOT NULL,
    mean_weight DECIMAL(10,2) NOT NULL,
    std_dev DECIMAL(10,2) NOT NULL,
    cv DECIMAL(6,2) NOT NULL,
    uniformity DECIMAL(6,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_measurement (flock_id, week, sex),
    CONSTRAINT fk_weight_measurements_flock FOREIGN KEY (flock_id) REFERENCES weight_flocks(id) ON DELETE CASCADE,
    CONSTRAINT fk_weight_measurements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_flock_week (flock_id, week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
