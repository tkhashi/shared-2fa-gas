import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// @ts-ignore - GASから渡されるグローバル変数
const initialData = window.INITIAL_DATA;

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App initialData={initialData} />
  </React.StrictMode>
);
