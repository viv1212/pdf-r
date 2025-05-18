import axios from 'axios';

export const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };
  
  export const findRelevantChunks = async (query, vectorStore, chunks) => {
    if (!chunks || chunks.length === 0) {
      return [];
    }
    
    // If there's only one chunk, just return it
    if (chunks.length === 1) {
      return chunks;
    }
    
    try {
      // Generate embedding for the query
      let queryVector;
      
      try {
        const response = await axios.post('http://localhost:11434/api/embeddings', {
          model: "nomic-embed-text",
          prompt: query
        });
        
        if (response.data && response.data.embedding) {
          queryVector = response.data.embedding;
        }
      } catch (error) {
        console.error('Error generating query embedding:', error);
      }
      
      if (!queryVector) {
        // Fallback: use term frequency for ranking
        const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
        
        const scoredChunks = chunks.map((chunk, index) => {
          const chunkLower = chunk.toLowerCase();
          let score = 0;
          
          queryTerms.forEach(term => {
            const regex = new RegExp(term, 'gi');
            const matches = chunkLower.match(regex);
            if (matches) {
              score += matches.length;
            }
          });
          
          return { chunk, score, index };
        });
        
        // Sort by score (descending) and take top 3
        const sortedChunks = scoredChunks
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        
        // Return chunks that have any relevance, or top chunk if none match
        const relevantChunks = sortedChunks.filter(item => item.score > 0);
        return relevantChunks.length > 0 ? relevantChunks.map(item => item.chunk) : [chunks[0]];
      }
      
      // Calculate similarity scores for all chunks
      const scoredChunks = vectorStore.map(item => {
        const similarity = cosineSimilarity(queryVector, item.vector);
        return { 
          chunk: item.chunk, 
          score: similarity,
          index: item.metadata?.index 
        };
      });
      
      // Sort by similarity and take top chunks
      const topChunks = scoredChunks
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      console.log('Top chunks scores:', topChunks.map(c => c.score));
      
      return topChunks.map(item => item.chunk);
    } catch (error) {
      console.error('Error finding relevant chunks:', error);
      // Fallback to return first chunk
      return [chunks[0]];
    }
  };