import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App, { router } from './App';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { AppContextProvider, store } from './stores';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <Provider store={store}>
      <AppContextProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <RouterProvider router={router}>
              <App />
          </RouterProvider>
        </LocalizationProvider>
      </AppContextProvider>
    </Provider>
);
