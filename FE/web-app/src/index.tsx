import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App, { router } from './App';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AppContextProvider } from './modules/shared/stores/appContext';
import { store } from './modules/shared';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <Provider store={store}>
      <AppContextProvider>
        <RouterProvider router={router}>
          <App />
        </RouterProvider>
      </AppContextProvider>
    </Provider>
  // <ErrorBoundary>
  // </ErrorBoundary>
);
