import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
//const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
const PrivateRoute = ({ children, }) => {
    const { token } = useAuth();
    const isLoading = token === undefined; // undefined solo antes de inicializar
    const isAuthenticated = !!token;
    if (isLoading)
        return _jsx("div", { children: "Cargando..." }); // o spinner
    return isAuthenticated ? children : _jsx(Navigate, { to: "/login", replace: true });
};
export default PrivateRoute;
