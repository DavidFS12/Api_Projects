import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Layout: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/*Sidebar*/}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 font-bold text-green-600 text-xl">Mi App</div>
        <nav className="flex-1">
          <ul className="space-y-2 px-4">
            <li>
              <a
                href="/dashboard"
                className="block p-2 rounded hover:bg-green-100"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="/proyectos"
                className="block p-2 rounded hover:bg-green-100"
              >
                Proyectos
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="h-14 bg-green-600 text-white flex justify-between item-center px-6">
          <span className="font-semibold">Panel de Control</span>
          <button
            onClick={logout}
            className="bg-white text-green 600 px-3 py-1 rounded hover:bg-gray-200"
          >
            Cerrar sesion
          </button>
        </header>

        {/*Content*/}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
