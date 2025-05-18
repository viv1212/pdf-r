import React from 'react';

const DocumentInfo = ({ file, extractedText, chunks }) => {
  if (!file) return null;
  
  return (
    <div className="document-info">
      <h3>Document Information</h3>
      <table>
        <tbody>
          <tr>
            <td>File Name:</td>
            <td>{file.name}</td>
          </tr>
          <tr>
            <td>File Size:</td>
            <td>{(file.size / 1024).toFixed(2)} KB</td>
          </tr>
          <tr>
            <td>Text Length:</td>
            <td>{extractedText.length.toLocaleString()} characters</td>
          </tr>
          <tr>
            <td>Word Count:</td>
            <td>{extractedText.split(/\s+/).filter(w => w.length > 0).length.toLocaleString()} words</td>
          </tr>
          <tr>
            <td>Chunks:</td>
            <td>{chunks.length}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DocumentInfo;