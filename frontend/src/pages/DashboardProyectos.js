import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getUserFromToken } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
const DashboardProyectos = () => {
    const token = localStorage.getItem("token");
    const [proyectos, setProyectos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editarProyecto, setEditarProyecto] = useState(null);
    const timeoutRef = useRef(null);
    const [userRol, setUserRol] = useState("");
    const [form, setForm] = useState({
        nombre: "",
        agua: 0,
        luz: 0,
        location: "",
        descripcion: "",
    });
    const navigate = useNavigate();
    const fetchProyecto = () => {
        if (!token)
            return;
        const user = getUserFromToken(token);
        if (user) {
            setUserRol(user.rol);
            console.log("usuario tipo: ", user.rol);
        }
        fetch("http://localhost:8000/proyectos", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setProyectos(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error al cargar proyectos: ", err))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchProyecto();
        return () => {
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);
        };
    }, []);
    const handleSubmit = async () => {
        if (!form.nombre ||
            !form.agua ||
            !form.luz ||
            !form.location ||
            !form.descripcion)
            return;
        try {
            const url = editarProyecto
                ? `http://localhost:8000/proyectos/${editarProyecto.id}`
                : `http://localhost:8000/proyectos/`;
            const method = editarProyecto ? "PUT" : "POST";
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            if (!res.ok)
                throw new Error("Error en la peticion");
            setShowModal(false);
            setEditarProyecto(null);
            setForm({ nombre: "", agua: 0, luz: 0, location: "", descripcion: "" });
            fetchProyecto();
        }
        catch (error) {
            console.error("Error al guardar proyecto: ", error);
        }
    };
    const openEditar = (proyecto) => {
        setEditarProyecto(proyecto);
        setForm({
            nombre: proyecto.nombre,
            agua: proyecto.agua,
            luz: proyecto.luz,
            location: proyecto.location,
            descripcion: proyecto.descripcion,
        });
        setShowModal(true);
    };
    const handleEliminarProyecto = async (proyectos_id) => {
        if (!token)
            return;
        fetch(`http://localhost:8000/proyectos/${proyectos_id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
            if (!res.ok)
                throw new Error("Error al eliminar proyecto");
            return res.json();
        })
            .then(() => fetchProyecto())
            .catch((err) => console.error("Error al eliminar proyecto: ", err));
    };
    return (_jsxs("div", { className: "max-w-6xl mx-auto sm:p-6", children: [_jsxs("div", { className: "flex-row md:flex justify-between items-center mb-6 gap-8", children: [_jsx("h1", { className: "text-3xl font-bold text-[#000051]", children: "Mis proyectos" }), userRol === "admin" && (_jsx("div", { className: "flex justify-end mb-4", children: _jsx("button", { onClick: () => navigate("/admin/usuarios"), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Gestion de Usuarios" }) })), _jsxs("div", { className: "flex justify-start my-4 gap-2 md:gap-8", children: [_jsx("button", { onClick: () => setShowModal(true), className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700", children: "+ Nuevo Proyecto" }), userRol === "usuario" && (_jsx("button", { onClick: () => navigate("/reporte-general"), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Ver Reporte General" }))] })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6", children: loading ? (_jsx("p", { children: "Cargando pryectos ..." })) : proyectos.length > 0 ? (proyectos.map((p) => (_jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition cursor-pointer", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold mb-2 text-[#000051]", children: p.nombre }), _jsxs("p", { className: "text-gray-500 text-sm", children: ["Agua: ", p.agua] }), _jsxs("p", { className: "text-gray-500 text-sm", children: ["Luz: ", p.luz] }), _jsxs("p", { className: "text-[#000051] font-semibold", children: ["Ubicacion: ", p.location] })] }), _jsx("div", { className: "mt-4 justify-between items-center", children: _jsxs("div", { className: "flex justify-between sm:justify-start sm:gap-2", children: [_jsx("button", { onClick: (e) => {
                                            e.stopPropagation();
                                            navigate(`/proyectos/${p.id}`);
                                        }, className: "px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm", children: "Ver" }), _jsx("button", { onClick: (e) => {
                                            e.stopPropagation();
                                            openEditar(p);
                                        }, className: "px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm", children: "Editar" }), _jsx("button", { type: "button", onClick: () => handleEliminarProyecto(p.id), className: "px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm", children: "Eliminar" })] }) })] }, p.id)))) : (_jsx("p", { className: "text-gray-500 col-span-full", children: "No tienes proyectos creados" })) }), showModal && (_jsx("div", { className: "fixed inset-0 bg-[#000]/80 flex items-center justify-center p-8", children: _jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-lg w-full max-w-md", children: [_jsx("h2", { className: "text-xl font-bold mb-4 text-[#000051]", children: editarProyecto ? "Editar Proyecto" : "Nuevo Proyecto" }), _jsx("input", { type: "text", placeholder: "Nombre del proyecto", value: form.nombre, onChange: (e) => setForm({ ...form, nombre: e.target.value }), className: "w-full border rounded-lg px-3 py-2 mb-3" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "number", value: form.agua, onChange: (e) => setForm({ ...form, agua: Number(e.target.value) }), className: "w-1/2 border rounded-lg px-3 py-2 mb-3" }), _jsx("input", { type: "number", value: form.luz, onChange: (e) => setForm({ ...form, luz: Number(e.target.value) }), className: "w-1/2 border rounded-lg px-3 py-2 mb-3" })] }), _jsx("input", { type: "text", value: form.location, onChange: (e) => setForm({ ...form, location: e.target.value }), className: "w-full border rounded-lg px-3 py-2 mb-3" }), _jsx("textarea", { value: form.descripcion, onChange: (e) => setForm({ ...form, descripcion: e.target.value }), className: "w-full p-2 border rounded" }), _jsxs("div", { className: "flex justify-end gap-3 mt-4", children: [_jsx("button", { onClick: () => {
                                        setShowModal(false);
                                        setEditarProyecto(null);
                                    }, className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700", children: "Cancelar" }), _jsx("button", { onClick: handleSubmit, className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700", children: "Guardar" })] })] }) }))] }));
};
export default DashboardProyectos;
