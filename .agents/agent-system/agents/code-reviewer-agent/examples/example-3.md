# Example 3: Python Backend Code Review (FastAPI)

## Mission
Review a FastAPI application for code quality, error handling, dependency injection, and testing patterns.

## Input — Code Under Review

```python
# ❌ Multiple issues
from fastapi import FastAPI
import sqlite3

app = FastAPI()

@app.get("/products")
def get_products():
    conn = sqlite3.connect("db.sqlite")
    cursor = conn.cursor()
    products = cursor.execute("SELECT * FROM products").fetchall()
    conn.close()
    return products

@app.post("/products")
def create_product(name: str, price: float):
    conn = sqlite3.connect("db.sqlite")
    cursor = conn.cursor()
    cursor.execute(f"INSERT INTO products (name, price) VALUES ('{name}', {price})")
    conn.commit()
    conn.close()
    return {"status": "created"}

@app.get("/products/{id}")
def get_product(id):
    conn = sqlite3.connect("db.sqlite")
    cursor = conn.cursor()
    product = cursor.execute(f"SELECT * FROM products WHERE id = {id}").fetchone()
    conn.close()
    return product
```

## Review Findings

| # | Issue | Severity | Fix |
|:--|:------|:---------|:----|
| 1 | SQL injection via f-strings | 🔴 Critical | Parameterized queries |
| 2 | Raw sqlite3 connection per request | 🟠 High | Use async ORM with connection pool |
| 3 | No request/response models | 🟠 High | Pydantic BaseModel |
| 4 | No error handling for DB errors | 🟠 High | HTTPException |
| 5 | `id` parameter has no type annotation | 🟡 Medium | Type hint: `id: int` |
| 6 | No dependency injection for DB | 🟡 Medium | FastAPI `Depends()` |
| 7 | Connection not in context manager | 🟡 Medium | `async with` pattern |
| 8 | No API versioning | 🟢 Info | Use `/api/v1/` prefix |

## Refactored Code

```python
# models/product.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., gt=0)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str]
    category: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
```

```python
# database.py — Async SQLAlchemy with dependency injection
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "sqlite+aiosqlite:///db.sqlite"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
```

```python
# routes/products.py — Clean FastAPI router
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.product import ProductCreate, ProductResponse
from orm.product import Product

router = APIRouter(prefix="/api/v1/products", tags=["products"])

@router.get("/", response_model=list[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product).offset(skip).limit(limit).order_by(Product.created_at.desc())
    )
    return result.scalars().all()

@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    product: ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    db_product = Product(**product.model_dump())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "code-reviewer-agent",
  "timestamp": "2026-04-08T15:00:00Z",
  "status": "success",
  "confidence": 0.94,
  "input_received": {
    "from_agent": null,
    "task_summary": "Review FastAPI product CRUD application",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "review",
    "data": {
      "total_issues": 8,
      "by_severity": {"critical": 1, "high": 3, "medium": 3, "info": 1},
      "improvements": [
        "Replaced raw SQL with async SQLAlchemy ORM",
        "Added Pydantic request/response models with validation",
        "Implemented dependency injection for database sessions",
        "Added proper error handling with HTTPException",
        "Applied API versioning (/api/v1/)",
        "Added query parameter validation (skip, limit)"
      ],
      "refactored_code_provided": true
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["models/product.py", "database.py", "routes/products.py"]
  },
  "context_info": {
    "input_tokens": 600,
    "output_tokens": 2500,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 2100,
    "tokens_used": 3100,
    "retry_count": 0,
    "risk_level": "low",
    "approval_status": "not_required",
    "checkpoint_id": null
  }
}
```

## Standards Applied
- Pydantic models for automatic request validation and response serialization
- Async SQLAlchemy for non-blocking database operations
- FastAPI dependency injection (`Depends()`) for clean session management
- Proper HTTP status codes (201 for creation, 404 for not found)
- API versioning for backward compatibility
- Query parameter validation with bounds (ge, le)
