import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
const ProyectoDetalle = () => {
    const { id } = useParams();
    const token = localStorage.getItem("token");
    const [proyecto, setProyecto] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [nuevoGasto, setNuevoGasto] = useState({
        nombre: "",
        cantidad: 0,
        p_unitario: 0,
        categoria: "",
        descripcion: "",
    });
    const [editandoGasto, setEditandoGasto] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const fetchProyecto = () => {
        if (!token || !id)
            return;
        fetch(`http://localhost:8000/proyectos/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setProyecto(data))
            .catch((err) => console.error(err));
    };
    const fetchResumen = () => {
        if (!token || !id)
            return;
        fetch(`http://localhost:8000/proyectos/${id}/resumen`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setResumen(data))
            .catch((err) => console.error("Error en resumen, ", err));
    };
    useEffect(() => {
        fetchProyecto();
        fetchResumen();
    }, [token, id]);
    // --- CREAR ---
    const handleAgregarGasto = (e) => {
        e.preventDefault();
        if (!token || !id)
            return;
        setLoading(true);
        fetch(`http://localhost:8000/proyectos/${id}/gastos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(nuevoGasto),
        })
            .then((res) => res.json())
            .then(() => {
            setNuevoGasto({
                nombre: "",
                cantidad: 0,
                p_unitario: 0,
                categoria: "",
                descripcion: "",
            });
            fetchProyecto();
        })
            .catch((err) => console.error("Error al agregar gasto:", err))
            .finally(() => setLoading(false));
    };
    // --- EDITAR ---
    const handleEditarGasto = (gasto) => {
        setEditandoGasto(gasto);
    };
    const handleGuardarEdicion = (e) => {
        e.preventDefault();
        if (!editandoGasto || !token)
            return;
        fetch(`http://localhost:8000/gastos/${editandoGasto.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(editandoGasto),
        })
            .then((res) => res.json())
            .then(() => {
            setEditandoGasto(null);
            fetchProyecto();
        })
            .catch((err) => console.error("Error al editar gasto:", err));
    };
    // --- ELIMINAR ---
    const handleEliminarGasto = (gastoId) => {
        if (!token)
            return;
        if (!window.confirm("¿Seguro que deseas eliminar este gasto?"))
            return;
        fetch(`http://localhost:8000/gastos/${gastoId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then(() => fetchProyecto())
            .catch((err) => console.error("Error al eliminar gasto:", err));
    };
    const handleDescargarExcel = async () => {
        if (!token)
            return;
        try {
            const res = await fetch("http://localhost:8000/reportes/excel", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok)
                throw new Error("Error al generar reporte");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "reporte_gastos.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
        catch {
            console.error("error al descargar excel");
        }
    };
    const handleDescargarPDF = async () => {
        if (!token)
            return;
        try {
            const res = await fetch("http://localhost:8000/reportes/pdf", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok)
                throw new Error("Error al generar reporte PDF");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "reporte_gastos.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
        catch {
            console.error("error al descargar pdf");
        }
    };
    const COLORS = ["#16a34a", "#22c55e", "#86efac", "#15803d", "#4ade80"];
    const dataChart = resumen
        ? Object.entries(resumen.gastos_por_categoria).map(([cat, total]) => ({
            name: cat,
            value: total,
        }))
        : [];
    if (!proyecto)
        return _jsx("p", { children: "Cargando proyecto..." });
    return (_jsxs("div", { className: "max-w-4xl mx-auto my-8 p-6 shadow-2xl rounded-2xl bg-white", children: [_jsx("h1", { className: "text-3xl font-bold mb-4 text-blue-700", children: proyecto.nombre }), _jsx("div", { className: "flex justify-end mb-4", children: _jsx("button", { type: "submit", onClick: () => navigate("/proyectos"), className: "bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-white", children: "Regresar" }) }), resumen && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white p-4 rounded-xl shadow", children: [_jsx("h3", { className: "text-gray-600", children: " Total de Gastos " }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: ["S/. ", resumen.total_gastos] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl shadow", children: [_jsx("h3", { className: "text-gray-600", children: " Numero de Gastos " }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: ["S/. ", resumen.numero_gastos] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl shadow", children: [_jsx("h3", { className: "text-gray-600", children: " Categor\u00EDas " }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: Object.keys(resumen.gastos_por_categoria).length })] })] })), resumen && dataChart.length > 0 && (_jsxs("div", { className: "bg-white p-6 rounded-xl shadow mb-8", children: [_jsx("h2", { className: "text-xl font-boald mb-4", children: " Gastos por Categoria" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: dataChart, cx: "50%", cy: "50%", labelLine: false, outerRadius: 120, fill: "#16a34a", dataKey: "value", label: ({ name, percent }) => `${name} ${(percent ?? 0).toFixed(0)}%`, children: dataChart.map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, {})] }) })] })), _jsxs("div", { className: "flex gap-4 justify-end", children: [_jsx("button", { onClick: handleDescargarExcel, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Exportar Excel" }), _jsx("button", { onClick: handleDescargarPDF, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Exportar PDF" })] }), _jsx("h2", { className: "text-2xl font-bold mb-3 text-blue-700", children: "Agregar Gasto" }), _jsxs("form", { onSubmit: handleAgregarGasto, className: "space-y-3 mb-6", children: [_jsx("input", { type: "text", placeholder: "Nombre del gasto", value: nuevoGasto.nombre, onChange: (e) => setNuevoGasto({ ...nuevoGasto, nombre: e.target.value }), className: "w-full p-2 border rounded", required: true }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "number", placeholder: "Cantidad", value: nuevoGasto.cantidad, onChange: (e) => setNuevoGasto({ ...nuevoGasto, cantidad: Number(e.target.value) }), className: "w-1/2 p-2 border rounded", required: true, min: 1 }), _jsx("input", { type: "number", placeholder: "P. Unitario", value: nuevoGasto.p_unitario, onChange: (e) => setNuevoGasto({
                                    ...nuevoGasto,
                                    p_unitario: Number(e.target.value),
                                }), className: "w-1/2 p-2 border rounded", required: true, min: 1 })] }), _jsx("input", { type: "text", placeholder: "Categor\u00EDa", value: nuevoGasto.categoria, onChange: (e) => setNuevoGasto({ ...nuevoGasto, categoria: e.target.value }), className: "w-full p-2 border rounded", required: true }), _jsx("textarea", { placeholder: "Descripci\u00F3n", value: nuevoGasto.descripcion, onChange: (e) => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value }), className: "w-full p-2 border rounded" }), _jsx("button", { type: "submit", disabled: loading, className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700", children: loading ? "Guardando..." : "Agregar Gasto" })] }), _jsx("h2", { className: "text-2xl font-bold mb-3 text-blue-700", children: "Gastos" }), proyecto.gastos.length > 0 ? (_jsx("div", { className: "space-y-3", children: proyecto.gastos.map((gasto) => (_jsx("div", { className: "bg-white p-4 rounded-xl shadow", children: editandoGasto?.id === gasto.id ? (_jsxs("form", { onSubmit: handleGuardarEdicion, className: "space-y-2", children: [_jsx("input", { type: "text", value: editandoGasto.nombre, onChange: (e) => setEditandoGasto({
                                    ...editandoGasto,
                                    nombre: e.target.value,
                                }), className: "w-full p-2 border rounded" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "number", value: editandoGasto.cantidad, onChange: (e) => setEditandoGasto({
                                            ...editandoGasto,
                                            cantidad: Number(e.target.value),
                                        }), className: "w-1/2 p-2 border rounded" }), _jsx("input", { type: "number", value: editandoGasto.p_unitario, onChange: (e) => setEditandoGasto({
                                            ...editandoGasto,
                                            p_unitario: Number(e.target.value),
                                        }), className: "w-1/2 p-2 border rounded" })] }), _jsx("input", { type: "text", value: editandoGasto.categoria, onChange: (e) => setEditandoGasto({
                                    ...editandoGasto,
                                    categoria: e.target.value,
                                }), className: "w-full p-2 border rounded" }), _jsx("textarea", { value: editandoGasto.descripcion, onChange: (e) => setEditandoGasto({
                                    ...editandoGasto,
                                    descripcion: e.target.value,
                                }), className: "w-full p-2 border rounded" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", className: "px-3 py-1 bg-green-600 text-white rounded-lg", children: "Guardar" }), _jsx("button", { type: "button", onClick: () => setEditandoGasto(null), className: "px-3 py-1 bg-gray-400 text-white rounded-lg", children: "Cancelar" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h3", { className: "font-semibold", children: gasto.nombre }), _jsxs("span", { children: ["S/. ", gasto.p_total] })] }), _jsxs("p", { className: "text-gray-500 text-sm", children: ["Cantidad: ", gasto.cantidad, " | P. Unitario: S/.", " ", gasto.p_unitario] }), _jsx("p", { className: "text-gray-400 text-sm", children: gasto.categoria }), gasto.descripcion && (_jsx("p", { className: "text-gray-400 text-sm", children: gasto.descripcion })), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { onClick: () => handleEditarGasto(gasto), className: "px-3 py-1 bg-blue-600 text-white rounded-lg", children: "Editar" }), _jsx("button", { onClick: () => handleEliminarGasto(gasto.id), className: "px-3 py-1 bg-red-600 text-white rounded-lg", children: "Eliminar" })] })] })) }, gasto.id))) })) : (_jsx("p", { className: "text-gray-500", children: "No hay gastos registrados." }))] }));
};
export default ProyectoDetalle;
