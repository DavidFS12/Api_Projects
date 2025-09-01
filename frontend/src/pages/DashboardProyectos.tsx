import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Proyectos {
  id: number;
  nombre: string;
  agua: number;
  luz: number;
  location: string;
  descripcion: string;
}

const DashboardProyectos: React.FC = () => {
  const token = localStorage.getItem("token");
  const [proyectos, setProyectos] = useState<Proyectos[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editarProyecto, setEditarProyecto] = useState<Proyectos | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    agua: 0,
    luz: 0,
    location: "",
    descripcion: "",
  });
  const navigate = useNavigate();

  const fetchProyecto = () => {
    if (!token) return;
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = async () => {
    if (
      !form.nombre ||
      !form.agua ||
      !form.luz ||
      !form.location ||
      !form.descripcion
    )
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

      if (!res.ok) throw new Error("Error en la peticion");

      setShowModal(false);
      setEditarProyecto(null);
      setForm({ nombre: "", agua: 0, luz: 0, location: "", descripcion: "" });
      fetchProyecto();
    } catch (error) {
      console.error("Error al guardar proyecto: ", error);
    }
  };

  const openEditar = (proyecto: Proyectos) => {
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

  const handleEliminarProyecto = async (proyectos_id: number) => {
    if (!token) return;

    fetch(`http://localhost:8000/proyectos/${proyectos_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al eliminar proyecto");
        return res.json();
      })
      .then(() => fetchProyecto())
      .catch((err) => console.error("Error al eliminar proyecto: ", err));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-600">Mis proyectos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Nuevo Proyecto
        </button>
      </div>

      {/* Lista de proyectos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Cargando pryectos ...</p>
        ) : proyectos.length > 0 ? (
          proyectos.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition cursor-pointer"
            >
              <div>
                <h2 className="text-xl font-bold mb-2">{p.nombre}</h2>
                <p className="text-gray-500 text-sm">Agua: {p.agua}</p>
                <p className="text-gray-500 text-sm">Luz: {p.luz}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-green-600 font-semibold">
                  Ubicacion: {p.location}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/proyectos/${p.id}`);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Ver
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditar(p);
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminarProyecto(p.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">
            No tienes proyectos creados
          </p>
        )}
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editarProyecto ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h2>

            <input
              type="text"
              placeholder="Nombre del proyecto"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <div className="flex gap-2">
              <input
                type="number"
                value={form.agua}
                onChange={(e) =>
                  setForm({ ...form, agua: Number(e.target.value) })
                }
                className="w-1/2 border rounded-lg px-3 py-2 mb-3"
              />

              <input
                type="number"
                value={form.luz}
                onChange={(e) =>
                  setForm({ ...form, luz: Number(e.target.value) })
                }
                className="w-1/2 border rounded-lg px-3 py-2 mb-3"
              />
            </div>

            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <textarea
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
              className="w-full p-2 border rounded"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditarProyecto(null);
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProyectos;
