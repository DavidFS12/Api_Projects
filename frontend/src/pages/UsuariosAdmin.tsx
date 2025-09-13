import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Usuario {
  id: number;
  name: string;
  email: string;
  role: string;
}

const UsuariosAdmin: React.FC = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [usuarios, setUsuario] = useState<Usuario[]>([]);
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
    return <p className="text-center mt-6">Cargando Usuarios ... </p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold text-blue-600">
          Administracion de Usuarios
        </h1>
        <button
          onClick={() => navigate("/proyectos")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Regresar
        </button>
      </div>

      {usuarios.length > 0 ? (
        <table className="w-full bg-white shadow rounded-2xl overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr className="border-t hover:bg-gray-50" key={u.id}>
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-sm ${
                      u.role === "admin"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 mt-4">No se encontraron usuarios</p>
      )}
    </div>
  );
};

export default UsuariosAdmin;
