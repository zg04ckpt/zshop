import React, { useEffect, useState } from 'react';
import './App.css';
import { createBrowserRouter, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { AdminLayout, AppDispatch, ConfirmDialog, Footer, setupInterceptors, setUser, TopBar } from './modules/shared';
import { ConfirmEmail, getLocalUser, Login, Register } from './modules/auth';
import { CateManagement, CreateBook, Detail, Home, ListBook, Search } from './modules/book';
import { Cart, Order } from './modules/payment';
import { AccountAddress, AccountHistory, AccountInfo, AccountLayout, UserManagement } from './modules/user';
import { Overview } from './modules/analysis';

export const router = createBrowserRouter([{ 
  path: '/',
  element: <App/>, 
  children: [

    { index: true, element: <Home/> },
    { path: 'search', element: <Search/> },
    { path: 'book', element: <Detail/> },
    { path: 'order', element: <Order/> },
    { path: 'cart', element: <Cart/> },
    { path: 'account', element: <AccountLayout/>, children: [
      { index: true, element: <AccountInfo/> },
      { path: 'address', element: <AccountAddress/> },
      { path: 'history', element: <AccountHistory/> },
    ]},
    
    { path: 'register', element: <Register/> },
    { path: 'login', element: <Login/> },
    { path: 'confirm-email', element: <ConfirmEmail/> },

    { path: 'cart', element: <Cart/> },
    { path: 'admin', element: <AdminLayout/>, children: [
      { index: true, path:'overview', element: <Overview/> },
      { path: 'product', element: <ListBook/> },
      { path: 'product/create', element: <CreateBook/> },
      { path: 'user', element: <UserManagement/> },
      { path: 'cate', element: <CateManagement/> },
    ]},
  ] 
}]);

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isApiReady, setIsApiReady] = useState<boolean>(false);
    
  useEffect(() => {
      dispatch(setUser(getLocalUser()));
  }, []);
  
  useEffect(() => {
      setupInterceptors(navigate, location, dispatch);
      setIsApiReady(true);
  }, []);

  return (
      <>
          {/* Content */}
          <div className="MainLayout">
              <TopBar/>
              <div className="container-lg page">
                  <Outlet context={{ isApiReady }}/>
              </div>
              <Footer/>
          </div>        
          <ScrollRestoration/>
          
          {/* Toast */}
          <Toaster />

          {/* Confirm dialog */}
          <ConfirmDialog/>
      </>
  );
}

export default App;
