import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Application bootstrap.
 *
 * We intentionally keep this file razor-thin: it only wires React to the DOM.
 * All experience logic lives inside <App /> and its children.
 */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Fatal: #root element not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
