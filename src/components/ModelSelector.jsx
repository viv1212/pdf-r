import React from 'react';

const ModelSelector = ({ selectedModel, availableModels, handleModelChange }) => {
  return (
    <div className="model-selector">
      <h3>Select AI Model</h3>
      <select
        value={selectedModel}
        onChange={(e) => handleModelChange(e.target.value)}
        className="model-select"
      >
        {availableModels.map((model, index) => (
          <option key={index} value={model.name}>
            {model.name}
          </option>
        ))}
      </select>
      <p className="model-info">Current model: {selectedModel}</p>
    </div>
  );
};

export default ModelSelector;
