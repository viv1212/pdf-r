import axios from 'axios';

export const fetchAvailableModels = async () => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    if (response.data && response.data.models) {
      return response.data.models;
    }
    return [{ name: 'llama3.2:1b' }];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [{ name: 'llama3.2:1b' }];
  }
};

export const generateResponseWithOllama = async (prompt, model, maxRetries = 3) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const response = await axios.post('http://localhost:11434/api/generate', {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      });

      return response.data.response;
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error);
      
      // Wait before retrying (exponential backoff)
      if (attempts < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      }
    }
  }
  
  return `Sorry, there was an error processing your request after ${maxRetries} attempts. Please check if Ollama is running correctly with the model "${model}".`;
};

export const generateSummary = async (text, summaryType, model) => {
  let prompt;
  
  switch (summaryType) {
    case 'brief':
      prompt = `
Please provide a brief summary of the following document in 2-3 paragraphs:

${text.substring(0, 15000)}

Your summary should capture the main points and overall message of the document.
`;
      break;
    case 'detailed':
      prompt = `
Please provide a detailed summary of the following document:

${text.substring(0, 15000)}

Your summary should be comprehensive, covering all major sections and key points from the document.
`;
      break;
    case 'bulletPoints':
      prompt = `
Please extract the key points from the following document as bullet points:

${text.substring(0, 15000)}

Provide 5-10 bullet points that capture the most important information.
`;
      break;
    default:
      prompt = `
Please summarize the following document:

${text.substring(0, 15000)}

Provide a concise summary that captures the essential information.
`;
  }
  
  return generateResponseWithOllama(prompt, model);
};