import React from 'react';
import { createRoot } from 'react-dom/client';
import TestRegister from './pages/TestRegister';
import './css/app.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TestRegister />);
}
