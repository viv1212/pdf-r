export const createChunks = (text) => {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for chunking');
    }
    
    // Handle empty text
    if (text.trim().length === 0) {
      return [];
    }
    
    try {
      const chunkSize = 1000; // Characters per chunk
      const overlap = 200; // Overlap between chunks
      
      // Try to split by paragraphs first
      const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
      
      if (paragraphs.length <= 1) {
        // If no paragraphs, fall back to sentence splitting
        return createChunksBySentences(text, chunkSize, overlap);
      }
      
      // Create chunks from paragraphs
      const chunks = [];
      let currentChunk = "";
      
      for (const paragraph of paragraphs) {
        // If adding this paragraph exceeds the chunk size, start a new chunk
        if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          // Start new chunk with overlap if possible
          const words = currentChunk.split(/\s+/);
          const overlapWords = words.slice(Math.max(0, words.length - 30)).join(' ');
          currentChunk = overlapWords + ' ' + paragraph;
        } else {
          // Add paragraph to current chunk
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
      }
      
      // Add the last chunk if it has content
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      
      console.log(`Created ${chunks.length} chunks from text of length ${text.length}`);
      return chunks;
    } catch (error) {
      console.error('Error in chunk creation:', error);
      
      // Fallback to simple chunking
      return createSimpleChunks(text, 1000, 200);
    }
  };
  
  // Helper function to create chunks by sentences
  const createChunksBySentences = (text, chunkSize, overlap) => {
    // Split by sentences (simple approximation)
    const sentences = text.split(/[.!?]+/).map(s => s.trim() + '.').filter(s => s.length > 3);
    
    const chunks = [];
    let currentChunk = "";
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  };
  
  // Fallback simple chunking
  const createSimpleChunks = (text, chunkSize, overlap) => {
    const chunks = [];
    let position = 0;
    
    while (position < text.length) {
      const end = Math.min(position + chunkSize, text.length);
      chunks.push(text.substring(position, end));
      position = end - overlap;
      
      // Break if we can't make progress
      if (position >= end) break;
    }
    
    return chunks;
  };
  
  // NEW: Detect document language (for i18n support)
  export const detectLanguage = (text) => {
    // Simple language detection - can be improved later
    const sample = text.substring(0, 1000).toLowerCase();
    
    // Check for common words in different languages
    const languages = [
      { code: 'en', words: ['the', 'and', 'of', 'to', 'in', 'is', 'that'], name: 'English' },
      { code: 'es', words: ['el', 'la', 'de', 'que', 'y', 'en', 'un'], name: 'Spanish' },
      { code: 'fr', words: ['le', 'la', 'de', 'et', 'est', 'en', 'que'], name: 'French' },
      { code: 'de', words: ['der', 'die', 'das', 'und', 'ist', 'von', 'zu'], name: 'German' }
    ];
    
    let bestMatch = { code: 'en', score: 0, name: 'English' };
    
    languages.forEach(lang => {
      let score = 0;
      lang.words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = sample.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      
      if (score > bestMatch.score) {
        bestMatch = { code: lang.code, score, name: lang.name };
      }
    });
    
    return bestMatch;
  };