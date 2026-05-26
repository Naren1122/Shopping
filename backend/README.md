# Bazar Backend API

## Features Implemented

### AI-Powered Semantic Search

Hybrid semantic search using hash-based embeddings with keyword pre-filtering.

**How it works:**
1. **Keyword Pre-filtering**: Only considers products containing search terms
2. **Embedding Ranking**: Ranks matching products by similarity score
3. **Fallback**: Falls back to keyword search if no matches

**API Usage:**
- `GET /api/products/search?q=query&semantic=true` - Semantic search
- `GET /api/products/search?q=query` - Regular keyword search

### Embedding Service

Located at `src/services/embedding.service.js`

- `generateEmbedding(text)` - Creates 768-dimension hash-based vectors (no API key required)
- `cosineSimilarity(a, b)` - Calculates similarity between vectors
- `semanticSearch(query, limit)` - Returns semantically ranked products

### Seeding Embeddings

**Run once to generate embeddings for existing products:**
```bash
npm run seed-embeddings
```

This populates the `embedding` field in all product documents.

### Environment Variables

Required in `src/.env`:
```
MONGO_URI=mongodb://localhost:27017/bazar
PORT=5000
```

Optional:
```
GEMINI_API_KEY=your-key  # For future real embedding support
```

### Frontend Integration

The frontend supports `?semantic=true` URL parameter to enable AI search mode.

Toggle between AI and keyword search using the button in the Navbar search dropdown.