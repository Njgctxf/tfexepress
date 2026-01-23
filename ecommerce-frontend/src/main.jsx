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
import { LocalizationProvider } from "./context/LocalizationContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LocalizationProvider>
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
      </LocalizationProvider>
    </BrowserRouter>
  </React.StrictMode>
);






