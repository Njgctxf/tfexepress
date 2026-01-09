import { createContext, useContext, useState } from "react";

const AdminUIContext = createContext();

export function AdminUIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminUIContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </AdminUIContext.Provider>
  );
}

export function useAdminUI() {
  return useContext(AdminUIContext);
}
