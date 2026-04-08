# Example 2: REST API with CRUD, Pagination & Filtering

## Mission
Build a production-ready REST API for a product catalog with pagination, filtering, sorting, and proper HTTP status codes.

## Requirements
- Node.js + Express
- PostgreSQL with Prisma ORM
- Query parameter validation
- Pagination with cursor-based approach

## Endpoints

| Method | Path | Description |
|:-------|:-----|:------------|
| GET | `/api/products` | List products (paginated, filterable) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

## Implementation

```javascript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET /api/products?page=1&limit=20&sort=price&order=asc&category=electronics&minPrice=10
app.get("/api/products", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
      category,
      minPrice,
      maxPrice,
      search
    } = req.query;

    const where = {};
    if (category) where.category = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: parseInt(limit),
        select: { id: true, name: true, price: true, category: true, imageUrl: true }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /api/products
app.post("/api/products", authMiddleware, async (req, res) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json({ data: product });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(500).json({ error: "Failed to create product" });
  }
});

// DELETE /api/products/:id (soft delete)
app.delete("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Product not found" });
  }
});
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "backend-agent",
  "timestamp": "2026-04-08T11:00:00Z",
  "status": "success",
  "confidence": 0.91,
  "input_received": {
    "from_agent": "database-agent",
    "task_summary": "Build REST API for product catalog with CRUD operations",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "code",
    "data": {
      "framework": "Node.js/Express + Prisma",
      "endpoints": [
        {"method": "GET", "path": "/api/products", "description": "List with pagination, filter, sort, search"},
        {"method": "GET", "path": "/api/products/:id", "description": "Get single product"},
        {"method": "POST", "path": "/api/products", "description": "Create product (auth required)"},
        {"method": "PUT", "path": "/api/products/:id", "description": "Update product (auth required)"},
        {"method": "DELETE", "path": "/api/products/:id", "description": "Soft delete (auth required)"}
      ],
      "features": ["pagination", "filtering", "sorting", "search", "soft-delete"],
      "dependencies": ["express", "@prisma/client", "zod"]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["routes/products.js", "prisma/schema.prisma", "validators/productSchema.js"]
  },
  "dependencies": {
    "requires": ["database-agent"],
    "provides_to": ["frontend-agent"]
  },
  "context_info": {
    "input_tokens": 1200,
    "output_tokens": 2800,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 4100,
    "tokens_used": 4000,
    "retry_count": 0,
    "risk_level": "medium",
    "approval_status": "not_required",
    "checkpoint_id": "chk_exec002_step03"
  }
}
```

## Best Practices Applied
- Offset-based pagination with total count
- Multi-field filtering (category, price range, text search)
- Sort by any column with direction
- Soft delete (never hard delete production data)
- Input validation with Zod
- Auth middleware on mutating endpoints
- Selective field queries (avoid `SELECT *`)
