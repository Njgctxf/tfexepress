import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";

import AdminDashboard from "./pages/AdminDashboard";
import Revenue from "./pages/Revenue";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Categories from "./pages/Categories";


import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Users from "./pages/Users";

import Coupons from "./pages/Coupons";
import Returns from "./pages/Returns";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Banners from "./pages/Banners";
import Faq from "./pages/Faq";
import AdminLogin from "./pages/AdminLogin";


import { AdminUIProvider } from "./context/AdminUIContext";
import { AdminNotificationsProvider } from "./context/AdminNotificationsContext";

export default function AdminRouter() {
  return (
    <AdminUIProvider>
      <AdminNotificationsProvider>
        <Routes>
          <Route path="login" element={<AdminLogin />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="revenue" element={<Revenue />} />

            {/* PRODUITS */}
            <Route path="products" element={<Products />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />

            {/* CATEGORIES */}
            <Route path="categories" element={<Categories />} />

            {/* MARKETING */}
            <Route path="banners" element={<Banners />} />
            <Route path="faq" element={<Faq />} />

            {/* COMMANDES */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />

            {/* RETOURS */}
            <Route path="returns" element={<Returns />} />

            {/* UTILISATEURS */}
            <Route path="users" element={<Users />} />

            {/* FIDELITE / OFFRES */}
            <Route path="coupons" element={<Coupons />} />

            {/* PARAMETRES */}
            <Route path="settings" element={<Settings />} />

            {/* NOTIFICATIONS */}
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </AdminNotificationsProvider>
    </AdminUIProvider>
  );
}
