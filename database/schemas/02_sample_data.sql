-- =====================================================
-- DATABASE INITIALIZATION - SAMPLE DATA
-- =====================================================

-- Insert Sample Customers
INSERT INTO customers (id, name, email, phone, loyalty_tier, reward_points) VALUES
('CUST-001', 'Vaibhav Kumar', 'vaibhav@example.com', '+1-555-0101', 'GOLD', 5000),
('CUST-002', 'Sarah Johnson', 'sarah.j@example.com', '+1-555-0102', 'SILVER', 2500),
('CUST-003', 'Mike Chen', 'mike.chen@example.com', '+1-555-0103', 'BRONZE', 800),
('CUST-004', 'Emma Wilson', 'emma.w@example.com', '+1-555-0104', 'PLATINUM', 8500),
('CUST-005', 'James Davis', 'james.d@example.com', '+1-555-0105', 'SILVER', 1500);

-- Insert Sample Orders
INSERT INTO orders (id, customer_id, order_date, total_amount, status, items_count, tracking_number) VALUES
('ORD-5521', 'CUST-001', '2026-05-20 14:30:00', 249.99, 'SHIPPED', 3, 'TRACK-1001'),
('ORD-5522', 'CUST-002', '2026-05-19 10:15:00', 189.50, 'DELIVERED', 2, 'TRACK-1002'),
('ORD-5523', 'CUST-003', '2026-05-18 16:45:00', 599.99, 'PROCESSING', 1, 'TRACK-1003'),
('ORD-5524', 'CUST-004', '2026-05-17 09:20:00', 1299.99, 'DELIVERED', 4, 'TRACK-1004'),
('ORD-5525', 'CUST-005', '2026-05-21 11:00:00', 89.99, 'PENDING', 1, 'TRACK-1005');

-- Insert Sample Order Items
INSERT INTO order_items (order_id, product_id, product_name, quantity, price_per_unit, total_price) VALUES
('ORD-5521', 'PROD-001', 'Wireless Headphones', 1, 129.99, 129.99),
('ORD-5521', 'PROD-002', 'Phone Case', 2, 29.99, 59.98),
('ORD-5521', 'PROD-003', 'Screen Protector', 1, 60.00, 60.00),
('ORD-5522', 'PROD-004', 'USB Cable', 3, 9.99, 29.97),
('ORD-5522', 'PROD-005', 'Power Bank', 1, 159.53, 159.53);

-- Insert System Configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('AI_MODEL', 'openai', 'Active AI model for intent detection'),
('MIN_RESPONSE_TIME', '5000', 'Minimum response time in milliseconds'),
('MAX_RETRY_ATTEMPTS', '3', 'Maximum retry attempts for API calls'),
('SESSION_TIMEOUT', '1800', 'Session timeout in seconds'),
('SATISFACTION_THRESHOLD', '4', 'Satisfaction rating threshold (out of 5)'),
('DB_POOL_SIZE', '20', 'Database connection pool size');
