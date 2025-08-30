import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Proyecto {
  id: number;
  nombre: string;
  agua: number;
  luz: number;
  location: string;
}

const DashboardProyectos: React.FC = () => {
  const token = localStorage.getItem("token");
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    console.log("Token usado:", token);

    fetch("http://localhost:8000/proyectos/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Data recibida:", data);
        if (Array.isArray(data)) setProyectos(data);
      })
      .catch((err) => console.error("error al cargar proyectos: ", err));
  }, [token]);
  console.log("proyectos: ", proyectos);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-600">Mis proyectos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {proyectos.length > 0 ? (
          proyectos.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition cursor-pointer"
              onClick={() => navigate(`proyectos/${p.id}`)}
            >
              <div>
                <h2 className="text-xl font-bold mb-2">{p.nombre}</h2>
                <p className="text-gray-500 text-sm">S. Agua: {p.agua}</p>
                <p className="text-gray-500 text-sm">S. Luz: {p.luz}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-green-600 font-semibold">
                  localizacion: {p.location}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/proyectos/${p.id}`);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">
            No tienes proyectos creados
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardProyectos;
