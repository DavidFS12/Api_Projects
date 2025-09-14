import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Layout: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/*Sidebar*/}
      <aside className="hidden md:block w-64 bg-gradient-to-t from-[#000] to-[#000051] shadow-lg flex-col">
        <div className="p-4 font-bold text-white text-xl">Codeman</div>
        <nav className="flex-1">
          <ul className="space-y-2 px-4">
            <li>
              <a
                href="/proyectos"
                className="block p-2 rounded hover:bg-blue-100 text-white hover:text-[#000051]"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="/proyectos"
                className="block p-2 rounded hover:bg-blue-100 text-white hover:text-[#000051]"
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
        <header className="h-14 bg-[#000051] text-white flex justify-between items-center px-6">
          <span className="font-semibold">Panel de Control</span>
          <button
            onClick={logout}
            className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-200"
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
