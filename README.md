# PDF RAG Chatbot

**PDF RAG Chatbot** is an AI-powered web application that allows users to upload PDF documents, ask questions about their content, and generate summaries. It leverages AI models to process and analyze the text, providing an interactive and intelligent experience for document exploration.

---

## 🚀 Features

- **PDF Upload and Processing**: Upload PDF files and extract text seamlessly.
- **AI-Powered Querying**: Ask questions about the document and get accurate answers using AI.
- **Document Summarization**: Generate brief, detailed, or bullet-point summaries of the document.
- **Interactive Chat Interface**: Engage in a chat-like experience to query document content.
- **AI Model Selection**: Choose from available AI models for customizable responses.
- **Local Storage**: Save and retrieve chat history for each document.

---

## 🛠️ Technologies Used

- **Frontend**: React, HTML, CSS
- **PDF Processing**: PDF.js
- **AI Models**: Ollama API for embeddings and natural language processing
- **State Management**: React Hooks
- **Utilities**: Local Storage for chat history, custom text processing utilities

---

## 📂 Project Structure

- **`src/components`**: Contains React components like `Header`, `FileUpload`, `ChatInterface`, and more.
- **`src/services`**: Includes services for PDF processing, embedding generation, and AI interactions.
- **`src/utils`**: Utility functions for text chunking, language detection, and vector operations.

---

## 🖥️ How to Run the Project Locally

### Prerequisites
- Node.js and npm installed on your system.
- Ollama API running locally (for AI model interactions).

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/viv1212/pdf-rag-chatbot.git
   cd pdf-rag-chatbot
2. Install dependencies:
   ```
   npm install
3. Start the development server:
   ```
   npm start
4. Open your browser and navigate to:
   ```
   http://localhost:3000


## 🤖 AI Models
The application uses AI models for:

- Generating embeddings for semantic search.
- Answering user queries based on document content.
- Summarizing the document in various formats.
### Available Models
- Default: llama3.2:1b
- Additional models can be configured via the Ollama API.

## 📬 Feedback
Feel free to open an issue or submit a pull request if you have suggestions or improvements. You can also reach out to me on LinkedIn.

## 🌟 Show Your Support
If you like this project, please give it a ⭐ on GitHub!

