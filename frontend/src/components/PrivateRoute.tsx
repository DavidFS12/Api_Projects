import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { token } = useAuth();
  const isLoading = token === undefined; // undefined solo antes de inicializar
  const isAuthenticated = !!token;

  if (isLoading) return <div>Cargando...</div>; // o spinner

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
