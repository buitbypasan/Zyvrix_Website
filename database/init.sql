-- Zyvrix initial database schema.
-- Run this script against a MySQL database before deploying the customer portal.

START TRANSACTION;

-- Helper to add a column only if it does not exist
DELIMITER $$
DROP PROCEDURE IF EXISTS add_column_if_not_exists $$
CREATE PROCEDURE add_column_if_not_exists(
  IN db_name VARCHAR(64),
  IN tbl_name VARCHAR(64),
  IN col_name VARCHAR(64),
  IN col_def TEXT
)
BEGIN
  IF (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = tbl_name AND COLUMN_NAME = col_name) = 0 THEN
    SET @s = CONCAT('ALTER TABLE `', db_name, '`.`', tbl_name, '` ADD COLUMN `', col_name, '` ', col_def);
    PREPARE st FROM @s;
    EXECUTE st;
    DEALLOCATE PREPARE st;
  END IF;
END $$
DELIMITER ;

-- Helper to add an index only if it does not exist
DELIMITER $$
DROP PROCEDURE IF EXISTS add_index_if_not_exists $$
CREATE PROCEDURE add_index_if_not_exists(
  IN db_name VARCHAR(64),
  IN tbl_name VARCHAR(64),
  IN idx_name VARCHAR(64),
  IN idx_columns TEXT,       -- e.g. '(`slug`)' or '(`cart_id`)'
  IN is_unique BOOLEAN
)
BEGIN
  IF (SELECT COUNT(*) FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = tbl_name AND INDEX_NAME = idx_name) = 0 THEN
    IF is_unique THEN
      SET @s = CONCAT('ALTER TABLE `', db_name, '`.`', tbl_name, '` ADD UNIQUE INDEX `', idx_name, '` ', idx_columns);
    ELSE
      SET @s = CONCAT('ALTER TABLE `', db_name, '`.`', tbl_name, '` ADD INDEX `', idx_name, '` ', idx_columns);
    END IF;
    PREPARE st FROM @s;
    EXECUTE st;
    DEALLOCATE PREPARE st;
  END IF;
END $$
DELIMITER ;

-- Tables
CREATE TABLE IF NOT EXISTS customers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'basic',
    provider VARCHAR(60) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- If your existing DB might not have role/provider columns,
-- these calls will add them only if missing.
CALL add_column_if_not_exists(DATABASE(), 'customers', 'role', "VARCHAR(50) NOT NULL DEFAULT 'basic'");
CALL add_column_if_not_exists(DATABASE(), 'customers', 'provider', "VARCHAR(60) DEFAULT NULL");

CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    category VARCHAR(120)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS carts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_carts_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_cart_product (cart_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id INT UNSIGNED NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    reference VARCHAR(32) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_each DECIMAL(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes if they do not exist
CALL add_index_if_not_exists(DATABASE(), 'products', 'idx_products_slug', '(`slug`)', FALSE);
CALL add_index_if_not_exists(DATABASE(), 'carts', 'idx_carts_customer', '(`customer_id`)', FALSE);
CALL add_index_if_not_exists(DATABASE(), 'cart_items', 'idx_cart_items_cart', '(`cart_id`)', FALSE);
CALL add_index_if_not_exists(DATABASE(), 'orders', 'idx_orders_cart', '(`cart_id`)', FALSE);
CALL add_index_if_not_exists(DATABASE(), 'order_items', 'idx_order_items_order', '(`order_id`)', FALSE);

-- Products seed (safe upsert)
INSERT INTO products (slug, name, description, price, category)
VALUES
    ('security-audit', 'Security & compliance audit', 'Deep-dive review mapped to OWASP and ISO controls.', 3600.00, 'Security'),
    ('seo-technical', 'Technical SEO & content sprint', 'Optimise Core Web Vitals, schema, and editorial workflows.', 2950.00, 'Growth'),
    ('performance-hardening', 'Performance hardening', 'Stress-test and tune critical journeys with profiling and caching.', 2400.00, 'Engineering'),
    ('api-integration', 'API & integration build', 'Design and ship robust REST or GraphQL endpoints.', 4200.00, 'Engineering'),
    ('mobile-polish', 'Mobile polish sprint', 'Stabilise Flutter or React Native apps with performance tuning.', 3300.00, 'Mobile'),
    ('ux-accessibility', 'Accessibility & UX review', 'Audit flows against WCAG 2.2 AA with actionable remediation.', 1750.00, 'Experience')
ON DUPLICATE KEY UPDATE slug = slug;

-- Clean up helper procedures
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;

COMMIT;
