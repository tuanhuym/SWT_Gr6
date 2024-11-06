import { createBrowserRouter } from 'react-router-dom';

import Homepage from './components/common/Homepage';
import LoginPage from './components/common/loginpage';
import RegisterPage from './components/common/registerpage';
import ProfilePage from './components/common/profilepage';
import Records from './components/common/orderhistory';
import TrackOrderPage from './components/common/trackorder';
import PlaceOrderPage from './components/common/placeorderpage';
import DeliveryPage from './components/common/delivery/deliverypickup';
import DeliveryDetail from './components/common/delivery/deliverydetail';
import AccountManagement from './components/common/accountmanagement';
import TransportService from './components/common/manager/transportservice';
import OrderConfirmation from './components/common/orderconfirmation';
import Delivery from './components/common/delivery/delivery';
import HealChecker from './components/common/healchecker/healchecker';
import Manager from './components/common/manager/manager';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Homepage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "register",
    element: <RegisterPage />,
  },
  {
    path: "profile",
    element: <ProfilePage />,
  },
  {
    path: "records",
    element: <Records />,
  },
  {
    path: "trackorder",
    element: <TrackOrderPage />,
  },
  {
    path: "placeorder",
    element: <PlaceOrderPage />,
  },
  {
    path: "deliverypage",
    element: <DeliveryPage />,
  },
  {
    path: "deliverydetail/:orderId",
    element: <DeliveryDetail />,
  },
  {
    path: "account-management",
    element: <AccountManagement />,
  },
  {
    path: "transport-service",
    element: <TransportService />,
  },
  {
    path: "order-confirmation",
    element: <OrderConfirmation />,
  },
  {
    path: "delivery",
    element: <Delivery />,
  },
  {
    path: "healchecker",
    element: <HealChecker />,
  },
  {
    path: "manager",
    element: <Manager />,
  }
]);
