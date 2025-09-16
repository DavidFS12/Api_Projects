import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
const Layout = () => {
    const { logout } = useAuth();
    return (_jsxs("div", { className: "flex h-screen bg-gray-100", children: [_jsxs("aside", { className: "hidden md:block w-64 bg-gradient-to-t from-[#000] to-[#000051] shadow-lg flex-col", children: [_jsx("div", { className: "p-4 font-bold text-white text-xl", children: "Codeman" }), _jsx("nav", { className: "flex-1", children: _jsxs("ul", { className: "space-y-2 px-4", children: [_jsx("li", { children: _jsx("a", { href: "/proyectos", className: "block p-2 rounded hover:bg-blue-100 text-white hover:text-[#000051]", children: "Dashboard" }) }), _jsx("li", { children: _jsx("a", { href: "/proyectos", className: "block p-2 rounded hover:bg-blue-100 text-white hover:text-[#000051]", children: "Proyectos" }) })] }) })] }), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsxs("header", { className: "h-14 bg-[#000051] text-white flex justify-between items-center px-6", children: [_jsx("span", { className: "font-semibold", children: "Panel de Control" }), _jsx("button", { onClick: logout, className: "bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-200", children: "Cerrar sesion" })] }), _jsx("main", { className: "flex-1 p-6 overflow-y-auto", children: _jsx(Outlet, {}) })] })] }));
};
export default Layout;
