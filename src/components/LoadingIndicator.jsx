import React from 'react';

const LoadingIndicator = ({ processingStep, loadingProgress }) => {
  return (
    <div className="processing-indicator">
      <p>{processingStep}</p>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${loadingProgress}%` }}
        ></div>
      </div>
      <p>{loadingProgress}%</p>
    </div>
  );
};

export default LoadingIndicator;