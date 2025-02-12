import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { reduxToolkitStore } from './shared/stores/redux-toolkit.store';
import { AppContextProvider } from './shared/stores/app.context';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
    
  // </React.StrictMode>
  <Provider store={reduxToolkitStore}>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </Provider>
);
