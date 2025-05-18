import React from 'react';

const FileUpload = ({ handleFileChange, file, pdfProcessed, extractTextFromPDF, isLoading }) => {
  return (
    <div className="upload-section">
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange} 
        className="file-input"
      />
      {file && !pdfProcessed && (
        <button 
          onClick={extractTextFromPDF} 
          className="process-button"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Process PDF'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;