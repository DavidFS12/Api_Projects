import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Gasto {
  id: number;
  nombre: string;
  cantidad: number;
  p_unitario: number;
  p_total: number;
  categoria: string;
  descripcion?: string;
}

interface Proyecto {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  gastos: Gasto[];
  total_gastos?: number;
}

interface ResumenProyecto {
  proyecto: Proyecto;
  total_gastos: number;
  numero_gastos: number;
  gastos_por_categoria: Record<string, number>;
}

const ProyectoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem("token");
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [resumen, setResumen] = useState<ResumenProyecto | null>(null);
  const [nuevoGasto, setNuevoGasto] = useState({
    nombre: "",
    cantidad: 0,
    p_unitario: 0,
    categoria: "",
    descripcion: "",
  });
  const [editandoGasto, setEditandoGasto] = useState<Gasto | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fetchProyecto = () => {
    if (!token || !id) return;
    fetch(`${import.meta.env.VITE_API_URL}/proyectos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProyecto(data))
      .catch((err) => console.error(err));
  };
  const fetchResumen = () => {
    if (!token || !id) return;
    fetch(`${import.meta.env.VITE_API_URL}/proyectos/${id}/resumen`, {
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
  const handleAgregarGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;

    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/proyectos/${id}/gastos`, {
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
  const handleEditarGasto = (gasto: Gasto) => {
    setEditandoGasto(gasto);
  };

  const handleGuardarEdicion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoGasto || !token) return;

    fetch(`${import.meta.env.VITE_API_URL}/gastos/${editandoGasto.id}`, {
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
  const handleEliminarGasto = (gastoId: number) => {
    if (!token) return;

    if (!window.confirm("¿Seguro que deseas eliminar este gasto?")) return;

    fetch(`${import.meta.env.VITE_API_URL}/gastos/${gastoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(() => fetchProyecto())
      .catch((err) => console.error("Error al eliminar gasto:", err));
  };

  const handleDescargarExcel = async () => {
    if (!token) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reportes/excel`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Error al generar reporte");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte_gastos.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      console.error("error al descargar excel");
    }
  };

  const handleDescargarPDF = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reportes/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al generar reporte PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte_gastos.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
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
  if (!proyecto) return <p>Cargando proyecto...</p>;

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 shadow-2xl rounded-2xl bg-white">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">
        {proyecto.nombre}
      </h1>
      <div className="flex justify-end mb-4">
        <button
          type="submit"
          onClick={() => navigate("/proyectos")}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-white"
        >
          Regresar
        </button>
      </div>
      {/* RESUMEN DE PROYECTO*/}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-gray-600"> Total de Gastos </h3>
            <p className="text-2xl font-bold text-blue-600">
              S/. {resumen.total_gastos}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-gray-600"> Numero de Gastos </h3>
            <p className="text-2xl font-bold text-blue-600">
              S/. {resumen.numero_gastos}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-gray-600"> Categorías </h3>
            <p className="text-2xl font-bold text-blue-600">
              {Object.keys(resumen.gastos_por_categoria).length}
            </p>
          </div>
        </div>
      )}

      {/* GRAFICO DE PROYECTO*/}
      {resumen && dataChart.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-boald mb-4"> Gastos por Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#16a34a"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent ?? 0).toFixed(0)}%`
                }
              >
                {dataChart.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* FORM CREAR */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={handleDescargarExcel}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Exportar Excel
        </button>
        <button
          onClick={handleDescargarPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Exportar PDF
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-3 text-blue-700">Agregar Gasto</h2>
      <form onSubmit={handleAgregarGasto} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Nombre del gasto"
          value={nuevoGasto.nombre}
          onChange={(e) =>
            setNuevoGasto({ ...nuevoGasto, nombre: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Cantidad"
            value={nuevoGasto.cantidad}
            onChange={(e) =>
              setNuevoGasto({ ...nuevoGasto, cantidad: Number(e.target.value) })
            }
            className="w-1/2 p-2 border rounded"
            required
            min={1}
          />
          <input
            type="number"
            placeholder="P. Unitario"
            value={nuevoGasto.p_unitario}
            onChange={(e) =>
              setNuevoGasto({
                ...nuevoGasto,
                p_unitario: Number(e.target.value),
              })
            }
            className="w-1/2 p-2 border rounded"
            required
            min={1}
          />
        </div>
        <input
          type="text"
          placeholder="Categoría"
          value={nuevoGasto.categoria}
          onChange={(e) =>
            setNuevoGasto({ ...nuevoGasto, categoria: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Descripción"
          value={nuevoGasto.descripcion}
          onChange={(e) =>
            setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })
          }
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {loading ? "Guardando..." : "Agregar Gasto"}
        </button>
      </form>

      {/* LISTA GASTOS */}
      <h2 className="text-2xl font-bold mb-3 text-blue-700">Gastos</h2>
      {proyecto.gastos.length > 0 ? (
        <div className="space-y-3">
          {proyecto.gastos.map((gasto) => (
            <div key={gasto.id} className="bg-white p-4 rounded-xl shadow">
              {editandoGasto?.id === gasto.id ? (
                <form onSubmit={handleGuardarEdicion} className="space-y-2">
                  <input
                    type="text"
                    value={editandoGasto.nombre}
                    onChange={(e) =>
                      setEditandoGasto({
                        ...editandoGasto,
                        nombre: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editandoGasto.cantidad}
                      onChange={(e) =>
                        setEditandoGasto({
                          ...editandoGasto,
                          cantidad: Number(e.target.value),
                        })
                      }
                      className="w-1/2 p-2 border rounded"
                    />
                    <input
                      type="number"
                      value={editandoGasto.p_unitario}
                      onChange={(e) =>
                        setEditandoGasto({
                          ...editandoGasto,
                          p_unitario: Number(e.target.value),
                        })
                      }
                      className="w-1/2 p-2 border rounded"
                    />
                  </div>
                  <input
                    type="text"
                    value={editandoGasto.categoria}
                    onChange={(e) =>
                      setEditandoGasto({
                        ...editandoGasto,
                        categoria: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    value={editandoGasto.descripcion}
                    onChange={(e) =>
                      setEditandoGasto({
                        ...editandoGasto,
                        descripcion: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-green-600 text-white rounded-lg"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditandoGasto(null)}
                      className="px-3 py-1 bg-gray-400 text-white rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{gasto.nombre}</h3>
                    <span>S/. {gasto.p_total}</span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Cantidad: {gasto.cantidad} | P. Unitario: S/.{" "}
                    {gasto.p_unitario}
                  </p>
                  <p className="text-gray-400 text-sm">{gasto.categoria}</p>
                  {gasto.descripcion && (
                    <p className="text-gray-400 text-sm">{gasto.descripcion}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleEditarGasto(gasto)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarGasto(gasto.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay gastos registrados.</p>
      )}
    </div>
  );
};

export default ProyectoDetalle;
