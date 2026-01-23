import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { SearchProvider } from "./context/SearchContext";
import { AdminUIProvider } from "./admin/context/AdminUIContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <FavoritesProvider>
              <AdminUIProvider>
                <SiteSettingsProvider>
                  <App />
                </SiteSettingsProvider>
              </AdminUIProvider>
            </FavoritesProvider>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);






