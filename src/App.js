import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';

// Import components
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ModelSelector from './components/ModelSelector';
import DocumentInfo from './components/DocumentInfo';
import ChatInterface from './components/ChatInterface';
import LoadingIndicator from './components/LoadingIndicator';
import SummaryView from './components/SummaryView';

// Import services
import { extractTextFromPDF } from './services/pdfService';
import { generateEmbeddings } from './services/embeddingService';
import { fetchAvailableModels, generateResponseWithOllama, generateSummary } from './services/ollamaService';
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from './services/storageService';

// Import utilities
import { createChunks, detectLanguage } from './utils/textProcessing';
import { findRelevantChunks } from './utils/vectorUtils';

function App() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [documentMetadata, setDocumentMetadata] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [vectorStore, setVectorStore] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfProcessed, setPdfProcessed] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama3.2:1b');
  const [availableModels, setAvailableModels] = useState([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showDocumentInfo, setShowDocumentInfo] = useState(false);
  const [documentLanguage, setDocumentLanguage] = useState({ code: 'en', name: 'English' });
  const [showSummaryView, setShowSummaryView] = useState(false);
  
  const chatContainerRef = useRef(null);
  
  // Fetch available models on component mount
  useEffect(() => {
    const initializeModels = async () => {
      const models = await fetchAvailableModels();
      setAvailableModels(models);
    };
    
    initializeModels();
  }, []);

  // Load chat history from localStorage when file changes
  useEffect(() => {
    if (file) {
      const fileId = `${file.name}-${file.lastModified}`;
      const savedHistory = loadFromLocalStorage(`chat-history-${fileId}`);
      if (savedHistory) {
        setMessages(savedHistory);
      }
    }
  }, [file]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (file && messages.length > 0) {
      const fileId = `${file.name}-${file.lastModified}`;
      saveToLocalStorage(`chat-history-${fileId}`, messages);
    }
  }, [messages, file]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setPdfProcessed(false);
      setExtractedText('');
      setChunks([]);
      setVectorStore([]);
      setMessages([]);
      setLoadingProgress(0);
      setProcessingStep('');
      setDocumentMetadata(null);
    } else {
      alert('Please select a PDF file');
    }
  };

  // Process PDF file
  const processPDF = async () => {
    if (!file) return;

    setIsLoading(true);
    setProcessingStep('Extracting text from PDF');
    setLoadingProgress(0);
    
    setMessages(prev => [
      ...prev, 
      { role: 'system', content: `Processing PDF "${file.name}"...` }
    ]);

    try {
      // Extract text from PDF
      const { fullText, metadata } = await extractTextFromPDF(file, setProcessingStep, setLoadingProgress);
      setExtractedText(fullText);
      setDocumentMetadata(metadata);
      
      // Detect document language
      const language = detectLanguage(fullText);
      setDocumentLanguage(language);
      
      setProcessingStep('Creating text chunks');
      setLoadingProgress(0);
      
      // Create chunks from the text
      const textChunks = createChunks(fullText);
      setChunks(textChunks);
      
      setProcessingStep('Generating embeddings');
      setLoadingProgress(0);
      
      // Generate embeddings for chunks
      const embeddedChunks = await generateEmbeddings(textChunks, setLoadingProgress);
      setVectorStore(embeddedChunks);
      
      // Update messages
      setMessages(prev => [
        ...prev, 
        { 
          role: 'system', 
          content: `PDF processed successfully. ${textChunks.length} chunks created.` +
                   ` Document appears to be in ${language.name}.` +
                   ` Ask questions about the document.`
        }
      ]);
      
      setPdfProcessed(true);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setMessages(prev => [
        ...prev, 
        { role: 'system', content: `Error processing PDF: ${error.message}` }
      ]);
    } finally {
      setIsLoading(false);
      setProcessingStep('');
      setLoadingProgress(100);
    }
  };

  // Handle model selection
  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  // Handle chat submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userQuery.trim() || !pdfProcessed) return;
    
    const query = userQuery.trim();
    setUserQuery('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    
    setIsLoading(true);
    setProcessingStep('Finding relevant content');
    
    try {
      // Find relevant chunks
      const relevantChunks = await findRelevantChunks(query, vectorStore, chunks);
      
      setProcessingStep('Generating response');
      
      // Build prompt for Ollama
      const prompt = `
You are a helpful AI assistant that answers questions about PDF documents.
Answer the following question based only on the provided document content.
Be concise and accurate. If the answer is not in the provided content, say "The document doesn't contain information about this."

Document content:
${relevantChunks.join('\n\n')}

Question: ${query}

Answer:`;
      
      // Generate response with Ollama
      const response = await generateResponseWithOllama(prompt, selectedModel);
      
      // Add assistant message to chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: response,
          relevantChunks: relevantChunks
        }
      ]);
    } catch (error) {
      console.error('Error handling query:', error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'system', 
          content: `Error: ${error.message}. Please try again.` 
        }
      ]);
    } finally {
      setIsLoading(false);
      setProcessingStep('');
    }
  };

  // Generate document summary using the selected model
  const handleGenerateSummary = async (text, summaryType) => {
    setIsLoading(true);
    setProcessingStep('Generating document summary');
    
    try {
      const summary = await generateSummary(text, summaryType, selectedModel);
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return "Error generating summary. Please try again.";
    } finally {
      setIsLoading(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="app-container">
      <Header />
      
      <div className="main-content">
        <div className="control-panel">
          <FileUpload 
            handleFileChange={handleFileChange} 
            file={file} 
            pdfProcessed={pdfProcessed} 
            extractTextFromPDF={processPDF}
            isLoading={isLoading}
          />
          
          <div className="toggles">
            <button 
              className={`toggle-btn ${showModelSelector ? 'active' : ''}`}
              onClick={() => setShowModelSelector(!showModelSelector)}
            >
              {showModelSelector ? 'Hide Models' : 'Show Models'}
            </button>
            
            <button 
              className={`toggle-btn ${showDocumentInfo ? 'active' : ''}`}
              onClick={() => setShowDocumentInfo(!showDocumentInfo)}
              disabled={!pdfProcessed}
            >
              {showDocumentInfo ? 'Hide Doc Info' : 'Show Doc Info'}
            </button>
            
            <button 
              className={`toggle-btn ${showSummaryView ? 'active' : ''}`}
              onClick={() => setShowSummaryView(!showSummaryView)}
              disabled={!pdfProcessed}
            >
              {showSummaryView ? 'Hide Summary' : 'Show Summary'}
            </button>
          </div>
          
          {showModelSelector && (
            <ModelSelector 
              selectedModel={selectedModel} 
              availableModels={availableModels} 
              handleModelChange={handleModelChange}
            />
          )}
          
          {showDocumentInfo && pdfProcessed && (
            <DocumentInfo 
              file={file} 
              extractedText={extractedText} 
              chunks={chunks}
            />
          )}
          
          {showSummaryView && pdfProcessed && (
            <SummaryView 
              extractedText={extractedText}
              generateSummary={handleGenerateSummary}
              isLoading={isLoading}
            />
          )}
        </div>
        
        {isLoading && loadingProgress < 100 && (
          <LoadingIndicator 
            processingStep={processingStep} 
            loadingProgress={loadingProgress} 
          />
        )}
        
        <ChatInterface 
          messages={messages}
          userQuery={userQuery}
          setUserQuery={setUserQuery}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          processingStep={processingStep}
          pdfProcessed={pdfProcessed}
        />
      </div>
    </div>
  );
}

export default App;