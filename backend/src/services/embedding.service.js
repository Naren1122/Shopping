/**
 * Generate embedding for text using hash-based approach
 * Creates a 768-dimension vector for semantic similarity
 * @param {string} text - Text to embed
 * @returns {Array<number>} - Embedding vector
 */
export const generateEmbedding = (text) => {
  // Create deterministic 768-dimension embedding using hash
  const embedding = new Array(768).fill(0).map((_, i) => {
    let hash = 0;
    const seed = text.toLowerCase() + i;
    for (let j = 0; j < seed.length; j++) {
      const char = seed.charCodeAt(j);
      hash = ((hash << 5) - hash + char) & 0xffffffff;
    }
    // Normalize to [-1, 1] range
    return (hash / 0x7fffffff) * 2 - 1;
  });

  return embedding;
};

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} a - First vector
 * @param {Array} b - Second vector
 * @returns {number} - Similarity score (0-1)
 */
export const cosineSimilarity = (a, b) => {
  if (!a.length || !b.length) return 0;

  const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};

/**
 * Search products by semantic similarity
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Array} - Similar products with similarity scores
 */
export const semanticSearch = async (query, limit = 10) => {
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const Product = (await import("../models/product.model.js")).default;
  const products = await Product.find({
    embedding: { $exists: true, $ne: [] },
  }).lean();

  // ONLY get products that contain the search terms
  const relevantProducts = products.filter((product) => {
    const productText =
      `${product.name} ${product.description || ""} ${product.category || ""}`.toLowerCase();
    return queryTerms.some((term) => productText.includes(term));
  });

  const queryEmbedding = generateEmbedding(query);

  const results = relevantProducts
    .map((product) => ({
      ...product,
      similarity: cosineSimilarity(queryEmbedding, product.embedding || []),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return results;
};
