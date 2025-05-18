import React, { useState } from 'react';

const SummaryView = ({ extractedText, generateSummary, isLoading }) => {
  const [summary, setSummary] = useState('');
  const [summaryType, setSummaryType] = useState('brief');
  const [showSummary, setShowSummary] = useState(false);

  const handleGenerateSummary = async () => {
    const generatedSummary = await generateSummary(extractedText, summaryType);
    setSummary(generatedSummary);
    setShowSummary(true);
  };

  if (!extractedText) return null;

  return (
    <div className="summary-section">
      <h3>Document Summary</h3>
      
      <div className="summary-controls">
        <select 
          value={summaryType} 
          onChange={(e) => setSummaryType(e.target.value)}
          className="summary-type-select"
        >
          <option value="brief">Brief Summary</option>
          <option value="detailed">Detailed Summary</option>
          <option value="bulletPoints">Key Points</option>
        </select>
        
        <button 
          onClick={handleGenerateSummary} 
          disabled={isLoading}
          className="generate-summary-btn"
        >
          {isLoading ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>

      {showSummary && summary && (
        <div className="summary-content">
          <h4>{summaryType === 'bulletPoints' ? 'Key Points' : 
               summaryType === 'detailed' ? 'Detailed Summary' : 'Brief Summary'}</h4>
          <div className="summary-text">
            {summaryType === 'bulletPoints' ? (
              <ul>
                {summary.split('\n').filter(point => point.trim()).map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            ) : (
              <p>{summary}</p>
            )}
          </div>
          <button className="close-summary-btn" onClick={() => setShowSummary(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default SummaryView;