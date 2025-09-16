import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface ProyectoResumen {
  proyecto: {
    id: number;
    nombre: string;
  };
  gasto_total: number;
  numero_gastos: number;
  por_categoria: Record<string, number>;
}

interface ReporteGeneral {
  usuario: string;
  gasto_total_general: number;
  detalle_proyecto: ProyectoResumen[];
}

const ReporteGeneral: React.FC = () => {
  const token = localStorage.getItem("token");
  const [reporte, setReporte] = useState<ReporteGeneral | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/reportes/general`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Reporte recibido: ", data);
        setReporte(data);
      })
      .catch((err) => console.error("Error en reporte recibido: ", err));
  }, [token]);

  if (!reporte) return <p className="text-center mt-6">Cargando reporte ...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Reporte General de: {reporte.usuario}
      </h1>
      <div className="flex justify-end mb-4">
        <button
          type="submit"
          onClick={() => navigate("/proyectos")}
          className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 text-white"
        >
          Regresar
        </button>
      </div>

      <div className="bg-white shadow reounded-2xl p-6 mb-6 flex justify-between">
        <div>
          <p className="text-gray-600">Gasto Total General</p>
          <h2 className="text-2xl font-bold text-blue-600">
            S/. {reporte.gasto_total_general}
          </h2>
        </div>
        <div>
          <p className="text-gray-600">Numero de proyectos</p>
          <h2 className="text-2xl font-bold">
            {reporte?.detalle_proyecto?.length ?? 0}
          </h2>
        </div>
      </div>

      <h2 className="text-xl font-boald mb-4">Proyectos</h2>
      <table className="w-full bg-white shadow rounded-2xl verflow-hidden mb-6">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-3 text-left">Proyectos</th>
            <th className="p-3">N° de Gastos</th>
            <th className="p-3">Gasto Total</th>
          </tr>
        </thead>
        <tbody>
          {reporte?.detalle_proyecto?.map((p) => (
            <tr key={p.proyecto.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{p.proyecto.nombre}</td>
              <td className="p-3 text-center">{p.numero_gastos}</td>
              <td className="p-3 text-center">S/. {p.gasto_total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold mb-4">
        Comparativa de Gasto por Proyecto
      </h2>
      <div className="bg-white shadow rounded-2xl p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={reporte?.detalle_proyecto?.map((p) => ({
              nombre: p.proyecto.nombre,
              gasto: p.gasto_total,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="gasto" fill="#16a34a" name="Gasto Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReporteGeneral;
