import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App, { router } from './App';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AppContextProvider } from './modules/shared/stores/appContext';
import { store } from './modules/shared';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'

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
