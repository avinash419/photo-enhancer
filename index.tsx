import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: Could not find root element with id 'root'");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("React Mounting Error:", error);
    rootElement.innerHTML = `
      <div style="
        color: #ff4d4d; 
        padding: 40px; 
        font-family: sans-serif; 
        background: #1a0000; 
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      ">
        <h1 style="margin-bottom: 20px;">Application Failed to Start</h1>
        <p style="color: #ccc; max-width: 600px;">${error instanceof Error ? error.message : String(error)}</p>
        <button onclick="window.location.reload()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #ff4d4d;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        ">Retry Reload</button>
      </div>
    `;
  }
}