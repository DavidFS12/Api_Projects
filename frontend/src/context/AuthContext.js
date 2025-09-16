import { jsx as _jsx } from "react/jsx-runtime";
// src/context/AuthContext.tsx
import { createContext, useContext, useState, } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const navigate = useNavigate();
    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        navigate("/proyectos");
    };
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
    };
    //const vl = useMemo(() => ({ token, login, logout }), [token]);
    const vl = {
        token,
        login,
        logout,
        isAuthenticated: !!token,
    };
    return _jsx(AuthContext.Provider, { value: vl, children: children });
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
};
export const getUserFromToken = (token) => {
    return jwtDecode(token);
};
