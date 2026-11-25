import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './style.css';
import './standalone.css';

createRoot(document.getElementById('root')!).render(<div className="ag-card"><App /></div>);
