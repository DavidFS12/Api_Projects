import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardProyectos from "./pages/DashboardProyectos";
import Layout from "./components/Layout";
import PrivateRoute from "@/components/PrivateRoute";
import ProyectoDetalle from "./pages/ProyectoDetalle";
import ReporteGeneral from "./pages/ReporteGeneral";
import UsuariosAdmin from "./pages/UsuariosAdmin";
function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { element: _jsx(Layout, {}), children: _jsx(Route, { path: "/proyectos", element: _jsx(PrivateRoute, { children: _jsx(DashboardProyectos, {}) }) }) }), _jsx(Route, { path: "/proyectos/:id", element: _jsx(ProyectoDetalle, {}) }), _jsx(Route, { path: "/reporte-general", element: _jsx(ReporteGeneral, {}) }), _jsx(Route, { path: "/admin/usuarios", element: _jsx(UsuariosAdmin, {}) })] }));
}
export default App;
