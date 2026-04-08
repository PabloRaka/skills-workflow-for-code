# Example: E-commerce Relational Database Design

## Input
Design database for online store

## Entities
- users
- products
- orders
- order_items

## Schema

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT,
  price NUMERIC,
  stock INT
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  total NUMERIC,
  created_at TIMESTAMP
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INT
);

## Optimization
- Index on user_id
- Foreign key constraints
- Transaction for order creation