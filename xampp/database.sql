-- ========================================================
-- Time Cafe & Pizzeria - MySQL Database Schema for XAMPP
-- Database Name: timecafe_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS `timecafe_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `timecafe_db`;

-- 1. Menu Items Table
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` ENUM('burgers', 'pizzas', 'cakes', 'hot_drinks', 'cold_drinks') NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `has_sizes` TINYINT(1) DEFAULT 0,
  `price_large` DECIMAL(10,2) DEFAULT NULL,
  `img` VARCHAR(500),
  `tag` VARCHAR(100),
  `in_stock` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `order_type` ENUM('dine_in', 'takeaway', 'delivery') NOT NULL,
  `table_number` VARCHAR(50) DEFAULT NULL,
  `delivery_address` TEXT DEFAULT NULL,
  `delivery_landmark` VARCHAR(255) DEFAULT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('telebirr', 'cbe_birr', 'chapa', 'cash') NOT NULL,
  `payment_status` ENUM('paid', 'pending_cash') DEFAULT 'pending_cash',
  `transaction_ref` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `menu_item_id` INT DEFAULT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL,
  `size` VARCHAR(50) DEFAULT 'Standard',
  `customization_json` JSON DEFAULT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Payment Verifications Log (ShegerPay & Verify.et)
CREATE TABLE IF NOT EXISTS `payment_verifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `provider` ENUM('shegerpay', 'verify_et', 'manual') NOT NULL,
  `reference_code` VARCHAR(100) NOT NULL,
  `payer_phone` VARCHAR(50),
  `amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('verified', 'unverified', 'failed') NOT NULL,
  `api_response_json` JSON DEFAULT NULL,
  `verified_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Blog Stories Table
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `excerpt` TEXT,
  `content` LONGTEXT,
  `author` VARCHAR(150) DEFAULT 'Time Cafe Management',
  `image_url` VARCHAR(500),
  `likes` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Sample Menu Items
INSERT INTO `menu_items` (`category`, `name`, `description`, `price`, `has_sizes`, `price_large`, `img`, `tag`, `in_stock`) VALUES
('burgers', 'Time Special Burger', 'Juicy beef patty, melted gouda, caramelized onions, house burger sauce, crisp lettuce.', 320.00, 0, NULL, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 'Chef Special', 1),
('burgers', 'Classic Cheese Burger', 'Prime grilled beef patty, double cheddar cheese, dill pickles, signature secret sauce.', 280.00, 0, NULL, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80', 'Bestseller', 1),
('pizzas', 'Time Special Pizza', 'Signature marinara, mozzarella, spiced beef, pepperoni, bell peppers, fresh basil.', 420.00, 1, 560.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', 'House Specialty', 1),
('pizzas', 'Meat Lovers Pizza', 'Packed with ground beef, spiced chicken chunks, beef bacon, and double mozzarella.', 450.00, 1, 590.00, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80', 'Popular', 1),
('hot_drinks', 'Special Ethiopian Coffee', 'Authentic Habesha Jebena organic roast, slow-brewed with natural mountain aromas.', 60.00, 0, NULL, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', 'Traditional', 1),
('cold_drinks', 'Fresh Avocado Juice', 'Creamy freshly pressed Asela valley avocado topped with fresh lime swirl.', 110.00, 0, NULL, 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80', 'Fresh Farm', 1);
