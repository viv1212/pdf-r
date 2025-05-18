import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

// Set the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const extractTextFromPDF = async (file, setProcessingStep, setLoadingProgress) => {
  if (!file) return '';

  try {
    // Read the file as an ArrayBuffer
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = async function() {
        try {
          const arrayBuffer = this.result;
          // Load the PDF document
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          
          loadingTask.onProgress = (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            setLoadingProgress(percentage);
          };
          
          const pdf = await loadingTask.promise;
          console.log(`PDF loaded. Number of pages: ${pdf.numPages}`);
          
          // Text extraction with page-by-page approach
          let fullText = '';
          let tableOfContents = '';
          let firstPageText = '';
          
          // Extract first page and table of contents first (for metadata)
          try {
            const page = await pdf.getPage(1);
            const textContent = await page.getTextContent();
            
            if (textContent && textContent.items) {
              firstPageText = textContent.items
                .filter(item => item.str && typeof item.str === 'string')
                .map(item => item.str)
                .join(' ');
            }
            
            // Check if the document has an outline (TOC)
            const outline = await pdf.getOutline();
            if (outline && outline.length > 0) {
              tableOfContents = outline.map(item => item.title).join('\n');
            }
          } catch (error) {
            console.error('Error extracting first page or TOC:', error);
          }
          
          // Extract text from all pages
          for (let i = 1; i <= pdf.numPages; i++) {
            setProcessingStep(`Extracting text from page ${i} of ${pdf.numPages}`);
            setLoadingProgress(Math.round((i / pdf.numPages) * 100));
            
            try {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              
              if (textContent && textContent.items) {
                const pageText = textContent.items
                  .filter(item => item.str && typeof item.str === 'string')
                  .map(item => item.str)
                  .join(' ');
                
                fullText += pageText + ' ';
              }
              
              console.log(`Page ${i}/${pdf.numPages} processed`);
            } catch (pageError) {
              console.error(`Error processing page ${i}:`, pageError);
              // Continue with other pages even if one fails
            }
          }
          
          // Return the extracted text along with metadata
          resolve({
            fullText,
            metadata: {
              pageCount: pdf.numPages,
              firstPageText,
              tableOfContents
            }
          });
        } catch (error) {
          console.error('Error processing PDF content:', error);
          reject(error);
        }
      };
      
      fileReader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      
      // Start reading the file
      fileReader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error('Error initiating PDF processing:', error);
    throw error;
  }
};