import React, { useRef, useEffect } from 'react';

const ChatInterface = ({ messages, userQuery, setUserQuery, handleSubmit, isLoading, processingStep, pdfProcessed }) => {
  const chatContainerRef = useRef(null);

  // Scroll to the bottom of chat container whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="messages" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role === 'user' ? 'user-message' : 
              message.role === 'system' ? 'system-message' : 'assistant-message'}`}
          >
            <div className="message-content">
              {message.content}
              
              {message.role === 'assistant' && message.relevantChunks && (
                <div className="source-info">
                  <button 
                    onClick={() => alert('Sources: Content from PDF document')}
                    className="source-button"
                  >
                    Sources
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content">
              {processingStep || 'Thinking...'}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder={pdfProcessed ? "Ask a question about the PDF..." : "Process a PDF first"}
          disabled={!pdfProcessed || isLoading}
          className="query-input"
        />
        <button 
          type="submit" 
          disabled={!pdfProcessed || isLoading || !userQuery.trim()} 
          className="submit-button"
        >
          Ask
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;