import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const UsuariosAdmin = () => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [usuarios, setUsuario] = useState([]);
    const [loading, setloading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetch("http://localhost:8000/admin/usuarios", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
            setUsuario(Array.isArray(data) ? data : []);
            console.log("data de user ", data);
        })
            .catch((err) => {
            console.error(err);
            setError("No tienes permisos para acceder a esta vista");
        })
            .finally(() => setloading(false));
    }, [token, navigate]);
    if (loading)
        return _jsx("p", { className: "text-center mt-6", children: "Cargando Usuarios ... " });
    if (error)
        return _jsx("p", { className: "text-center mt-6 text-red-500", children: error });
    return (_jsxs("div", { className: "max-w-6xl mx-auto p-6", children: [_jsxs("div", { className: "flex justify-between mb-4", children: [_jsx("h1", { className: "text-3xl font-bold text-blue-600", children: "Administracion de Usuarios" }), _jsx("button", { onClick: () => navigate("/proyectos"), className: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600", children: "Regresar" })] }), usuarios.length > 0 ? (_jsxs("table", { className: "w-full bg-white shadow rounded-2xl overflow-hidden", children: [_jsx("thead", { className: "bg-blue-600 text-white", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3 text-left", children: "ID" }), _jsx("th", { className: "p-3 text-left", children: "Nombre" }), _jsx("th", { className: "p-3 text-left", children: "Email" }), _jsx("th", { className: "p-3 text-left", children: "Rol" })] }) }), _jsx("tbody", { children: usuarios.map((u) => (_jsxs("tr", { className: "border-t hover:bg-gray-50", children: [_jsx("td", { className: "p-3", children: u.id }), _jsx("td", { className: "p-3", children: u.name }), _jsx("td", { className: "p-3", children: u.email }), _jsx("td", { className: "p-3", children: _jsx("span", { className: `px-2 py-1 rounded-lg text-sm ${u.role === "admin"
                                            ? "bg-red-100 text-red-600"
                                            : "bg-green-100 text-green-600"}`, children: u.role }) })] }, u.id))) })] })) : (_jsx("p", { className: "text-gray-500 mt-4", children: "No se encontraron usuarios" }))] }));
};
export default UsuariosAdmin;
