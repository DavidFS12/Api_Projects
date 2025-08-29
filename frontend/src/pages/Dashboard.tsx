import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserFromToken } from "@/context/AuthContext";

interface Proyecto {
  id: number;
  nombre: string;
}

const Dashboard: React.FC = () => {
  const token = localStorage.getItem("token");
  const { logout } = useAuth();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRol, setUserRol] = useState<string>("");

  useEffect(() => {
    if (token) {
      const user = getUserFromToken(token);

      setUserEmail(user.sub);
      setUserRol(user.rol);

      const url = "http://localhost:8000/proyectos/";

      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setProyectos(data);
        })
        .catch((err) => console.error(err));
    }
  }, [token]);
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Bienvenido, {userEmail} ({userRol})
        </h1>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={logout}
        >
          Cerrar Sesion
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-4">Proyectos</h2>
      <ul>
        {proyectos.map((proyecto) => (
          <li key={proyecto.id} className="mb-2 p-2 border rounded">
            {proyecto.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
