import axios from 'axios';

export const generateEmbeddings = async (textChunks, setLoadingProgress) => {
  try {
    const embeddedChunks = await Promise.all(
      textChunks.map(async (chunk, index) => {
        setLoadingProgress(Math.round((index / textChunks.length) * 100));
        
        try {
          // Use Ollama for embeddings
          const response = await axios.post('http://localhost:11434/api/embeddings', {
            model: "nomic-embed-text",
            prompt: chunk
          });
          
          if (response.data && response.data.embedding) {
            return { 
              chunk, 
              vector: response.data.embedding,
              metadata: { index }
            };
          } else {
            // Fallback: create a simple TF-IDF style vector
            const words = chunk.toLowerCase().split(/\W+/).filter(word => word.length > 2);
            const wordCounts = {};
            words.forEach(word => {
              wordCounts[word] = (wordCounts[word] || 0) + 1;
            });
            
            // Create a simple vector from word frequencies
            const simpleVector = Object.values(wordCounts);
            return { chunk, vector: simpleVector, metadata: { index } };
          }
        } catch (error) {
          console.error(`Error generating embedding for chunk ${index}:`, error);
          
          // Return a simple vector as fallback
          const words = chunk.toLowerCase().split(/\W+/).filter(word => word.length > 2);
          const wordSet = [...new Set(words)]; // unique words
          const simpleVector = wordSet.map(() => 1); // presence/absence vector
          
          return { chunk, vector: simpleVector, metadata: { index } };
        }
      })
    );
    
    return embeddedChunks;
  } catch (error) {
    console.error('Error in generateEmbeddings:', error);
    throw error;
  }
};