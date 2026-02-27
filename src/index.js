import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Import components
import App from './App';

// Import styles
import './styles/index.scss';

// Import WebVitals
import reportWebVitals from './reportWebVitals';

try {
  const storedTheme = localStorage.getItem('isDarkTheme');
  const isDarkTheme = storedTheme ? JSON.parse(storedTheme) : false;
  const theme = isDarkTheme ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.body.dataset.theme = theme;
} catch {
  document.documentElement.dataset.theme = 'light';
  document.body.dataset.theme = 'light';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
