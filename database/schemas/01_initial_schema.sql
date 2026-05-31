-- =====================================================
-- AI-POWERED CUSTOMER SUPPORT DATABASE SCHEMA
-- =====================================================
-- MySQL/PostgreSQL Schema for production support system

-- =====================================================
-- TABLE: CUSTOMERS
-- =====================================================
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    loyalty_tier VARCHAR(50) DEFAULT 'BRONZE',
    reward_points INT DEFAULT 0,
    total_spending DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_loyalty_tier (loyalty_tier)
);

-- =====================================================
-- TABLE: ORDERS
-- =====================================================
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    order_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    items_count INT DEFAULT 0,
    shipping_address TEXT,
    tracking_number VARCHAR(100),
    expected_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
);

-- =====================================================
-- TABLE: ORDER_ITEMS
-- =====================================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
);

-- =====================================================
-- TABLE: SUPPORT_QUERIES
-- =====================================================
CREATE TABLE support_queries (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(100),
    customer_id VARCHAR(50),
    query_text TEXT NOT NULL,
    intent VARCHAR(100),
    detected_entities JSON,
    ai_response TEXT,
    resolution_status VARCHAR(50) DEFAULT 'PENDING',
    resolution_time_minutes INT,
    satisfaction_rating INT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_session_id (session_id),
    INDEX idx_status (resolution_status),
    INDEX idx_intent (intent),
    FULLTEXT INDEX ft_query (query_text)
);

-- =====================================================
-- TABLE: CONVERSATION_HISTORY
-- =====================================================
CREATE TABLE conversation_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    customer_id VARCHAR(50),
    message_role VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABLE: AI_ANALYTICS
-- =====================================================
CREATE TABLE ai_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    total_queries INT DEFAULT 0,
    resolved_queries INT DEFAULT 0,
    avg_resolution_minutes DECIMAL(5, 2),
    customer_satisfaction_rate DECIMAL(5, 2),
    top_intents JSON,
    system_performance JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
);

-- =====================================================
-- TABLE: SYSTEM_CONFIG
-- =====================================================
CREATE TABLE system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES for Performance Optimization
-- =====================================================
CREATE INDEX idx_query_created_at ON support_queries(created_at);
CREATE INDEX idx_order_customer_date ON orders(customer_id, order_date);
CREATE INDEX idx_conversation_session_time ON conversation_history(session_id, created_at);
