# Example 1: E-commerce Relational Database Design

## Mission
Design a normalized relational database for an online store with users, products, orders, inventory tracking, and proper indexing strategy.

## Requirements
- PostgreSQL
- 3NF normalization
- UUID primary keys
- Timestamp tracking
- Proper foreign key constraints
- Indexing for common queries

## Schema

```sql
-- Users table with soft delete
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Products with category and inventory
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Orders with status tracking
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  status order_status DEFAULT 'pending',
  subtotal NUMERIC(10, 2) NOT NULL,
  tax NUMERIC(10, 2) DEFAULT 0,
  shipping_fee NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_published ON products(is_published) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "database-agent",
  "timestamp": "2026-04-08T09:00:00Z",
  "status": "success",
  "confidence": 0.95,
  "input_received": {
    "from_agent": null,
    "task_summary": "Design relational database for e-commerce platform",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "design",
    "data": {
      "db_type": "PostgreSQL",
      "tables": ["users", "categories", "products", "orders", "order_items"],
      "total_tables": 5,
      "normalization": "3NF",
      "schema": {
        "users": {"columns": 8, "pk": "id (UUID)", "unique": ["email"], "soft_delete": true},
        "categories": {"columns": 4, "pk": "id (UUID)", "self_referencing": true},
        "products": {"columns": 10, "pk": "id (UUID)", "fk": ["category_id"], "soft_delete": true},
        "orders": {"columns": 10, "pk": "id (UUID)", "fk": ["user_id"], "enum": "order_status"},
        "order_items": {"columns": 6, "pk": "id (UUID)", "fk": ["order_id", "product_id"]}
      },
      "indexes": 9,
      "triggers": 3,
      "constraints": ["CHECK (price >= 0)", "CHECK (stock >= 0)", "CHECK (quantity > 0)"],
      "features": ["soft delete", "auto-updated timestamps", "ENUM status", "JSONB for address"]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["migrations/001_create_tables.sql", "migrations/002_create_indexes.sql", "seeds/sample_data.sql"]
  },
  "pre_execution_snapshot": {
    "snapshot_id": "snap_exec001_db",
    "files_modified": [],
    "files_created": ["migrations/001_create_tables.sql", "migrations/002_create_indexes.sql"],
    "files_deleted": [],
    "schema_changes": ["CREATE TABLE users", "CREATE TABLE categories", "CREATE TABLE products", "CREATE TABLE orders", "CREATE TABLE order_items"],
    "config_changes": []
  },
  "context_info": {
    "input_tokens": 600,
    "output_tokens": 3500,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 2800,
    "tokens_used": 4100,
    "retry_count": 0,
    "risk_level": "high",
    "approval_status": "approved",
    "checkpoint_id": "chk_exec001_step01"
  }
}
```

## Best Practices Applied
- UUID primary keys (distributed-safe)
- 3NF normalization with proper foreign keys
- Soft delete pattern using `deleted_at` column
- Partial indexes for performance (WHERE deleted_at IS NULL)
- CHECK constraints for data integrity
- Auto-updating timestamps via triggers
- ENUM type for order status (type-safe)
- JSONB for flexible address data