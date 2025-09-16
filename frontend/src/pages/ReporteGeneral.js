import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, } from "recharts";
const ReporteGeneral = () => {
    const token = localStorage.getItem("token");
    const [reporte, setReporte] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        if (!token)
            return;
        fetch("http://localhost:8000/reportes/general", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
            console.log("Reporte recibido: ", data);
            setReporte(data);
        })
            .catch((err) => console.error("Error en reporte recibido: ", err));
    }, [token]);
    if (!reporte)
        return _jsx("p", { className: "text-center mt-6", children: "Cargando reporte ..." });
    return (_jsxs("div", { className: "max-w-6xl mx-auto p-6", children: [_jsxs("h1", { className: "text-3xl font-bold text-blue-600 mb-6", children: ["Reporte General de: ", reporte.usuario] }), _jsx("div", { className: "flex justify-end mb-4", children: _jsx("button", { type: "submit", onClick: () => navigate("/proyectos"), className: "bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 text-white", children: "Regresar" }) }), _jsxs("div", { className: "bg-white shadow reounded-2xl p-6 mb-6 flex justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Gasto Total General" }), _jsxs("h2", { className: "text-2xl font-bold text-blue-600", children: ["S/. ", reporte.gasto_total_general] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Numero de proyectos" }), _jsx("h2", { className: "text-2xl font-bold", children: reporte?.detalle_proyecto?.length ?? 0 })] })] }), _jsx("h2", { className: "text-xl font-boald mb-4", children: "Proyectos" }), _jsxs("table", { className: "w-full bg-white shadow rounded-2xl verflow-hidden mb-6", children: [_jsx("thead", { className: "bg-blue-600 text-white", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3 text-left", children: "Proyectos" }), _jsx("th", { className: "p-3", children: "N\u00B0 de Gastos" }), _jsx("th", { className: "p-3", children: "Gasto Total" })] }) }), _jsx("tbody", { children: reporte?.detalle_proyecto?.map((p) => (_jsxs("tr", { className: "border-t hover:bg-gray-50", children: [_jsx("td", { className: "p-3", children: p.proyecto.nombre }), _jsx("td", { className: "p-3 text-center", children: p.numero_gastos }), _jsxs("td", { className: "p-3 text-center", children: ["S/. ", p.gasto_total] })] }, p.proyecto.id))) })] }), _jsx("h2", { className: "text-xl font-bold mb-4", children: "Comparativa de Gasto por Proyecto" }), _jsx("div", { className: "bg-white shadow rounded-2xl p-6", children: _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(BarChart, { data: reporte?.detalle_proyecto?.map((p) => ({
                            nombre: p.proyecto.nombre,
                            gasto: p.gasto_total,
                        })), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "nombre" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Bar, { dataKey: "gasto", fill: "#16a34a", name: "Gasto Total" })] }) }) })] }));
};
export default ReporteGeneral;
