import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Router } from 'react-router';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
    {/* <Router location={} navigator={}></Router> */}
  </React.StrictMode>,
  document.getElementById('root'),
);
