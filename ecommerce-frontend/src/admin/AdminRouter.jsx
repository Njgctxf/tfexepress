import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";

import AdminDashboard from "./pages/AdminDashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Categories from "./pages/Categories";
import FeaturedCategories from "./pages/AdminFeaturedCategories";

import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Users from "./pages/Users";
import AdminFeaturedCategories from "./pages/AdminFeaturedCategories";

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />

        {/* PRODUITS */}
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />

        {/* CATEGORIES */}
        <Route path="categories" element={<Categories />} />
        <Route
          path="featured-categories"
          element={<AdminFeaturedCategories />}
        />

        {/* COMMANDES */}
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />

        {/* UTILISATEURS */}
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}
