-- =============================================
-- Luna Pharmacy Management System - Database Setup
-- Run this file to create tables, sample data, and owner account
-- =============================================

-- 1. Create the users table (Owner Authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'owner',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default owner account (username: admin, password: luna1234)
-- The hash below is generated with bcryptjs for password 'luna1234'
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2a$10$wY9eE2vM2h8h8Y/w7zM5QeL0N3qP1vR6xY8sK2uW0iT5jM9mB2l2K', 'owner')
ON CONFLICT (username) DO NOTHING;

-- 2. Create the drugs table
CREATE TABLE IF NOT EXISTS drugs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create the sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    drug_id INTEGER REFERENCES drugs(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT NOW()
);

-- Insert sample drugs data
INSERT INTO drugs (name, category, price, stock) VALUES
    ('Amoxicillin 500mg', 'Antibiotic', 12.50, 150),
    ('Paracetamol 500mg', 'Pain Relief', 3.00, 300),
    ('Ibuprofen 400mg', 'Pain Relief', 5.50, 200),
    ('Omeprazole 20mg', 'Gastric', 8.00, 100),
    ('Metformin 500mg', 'Diabetes', 6.75, 180),
    ('Amlodipine 5mg', 'Blood Pressure', 7.25, 90),
    ('Ciprofloxacin 500mg', 'Antibiotic', 15.00, 60),
    ('Loratadine 10mg', 'Allergy', 4.50, 250),
    ('Azithromycin 250mg', 'Antibiotic', 18.00, 45),
    ('Cetirizine 10mg', 'Allergy', 3.75, 220),
    ('Diclofenac 50mg', 'Pain Relief', 6.00, 130),
    ('Metoprolol 50mg', 'Blood Pressure', 9.50, 75),
    ('Atorvastatin 20mg', 'Cholesterol', 11.00, 110),
    ('Pantoprazole 40mg', 'Gastric', 10.00, 85),
    ('Salbutamol Inhaler', 'Respiratory', 14.00, 40),
    ('Doxycycline 100mg', 'Antibiotic', 8.50, 95),
    ('Ranitidine 150mg', 'Gastric', 4.00, 0),
    ('Aspirin 75mg', 'Blood Thinner', 2.50, 350),
    ('Clopidogrel 75mg', 'Blood Thinner', 13.00, 0),
    ('Vitamin C 500mg', 'Vitamin', 3.50, 400)
ON CONFLICT DO NOTHING;

-- Insert some sample sales for testing
INSERT INTO sales (drug_id, quantity, unit_price, total_price, sale_date) VALUES
    (2, 5, 3.00, 15.00, NOW()),
    (1, 2, 12.50, 25.00, NOW()),
    (3, 3, 5.50, 16.50, NOW()),
    (8, 4, 4.50, 18.00, NOW()),
    (5, 2, 6.75, 13.50, NOW()),
    (2, 10, 3.00, 30.00, NOW()),
    (18, 6, 2.50, 15.00, NOW()),
    (4, 1, 8.00, 8.00, NOW()),
    (13, 3, 11.00, 33.00, NOW()),
    (20, 8, 3.50, 28.00, NOW());
