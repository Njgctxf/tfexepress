import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import CategoryProducts from "./pages/CategoryProducts";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import SearchPage from "./pages/SearchPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRouter from "./admin/AdminRouter";
import ProtectedRoute from "./routes/ProtectedRoute";
import AddProduct from  "./admin/pages/AddProduct";

function App() {
  return (
    <Routes>
      {/* 🌍 PUBLIC */}
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/category/:category" element={<CategoryProducts />} />
      <Route path="/category-page/:slug" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />

      {/* 🔐 AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🔒 PROTECTED */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        }
      />

      {/* 🛠 ADMIN (UNE SEULE FOIS) */}
      <Route path="/admin/*" element={<AdminRouter />} />
      <Route path="/admin/products/add" element={<AddProduct />} />
    </Routes>
  );
}

export default App;
