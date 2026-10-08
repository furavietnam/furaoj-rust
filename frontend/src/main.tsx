import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Logic: Mounts the React application tree into the root DOM node with StrictMode.
// Input: Target DOM element 'root'.
// Output: Rendered React virtual DOM tree.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
