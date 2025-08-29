import React, { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { login } = useAuth(); // usamos login del contexto

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // Enviamos los datos como x-www-form-urlencoded (FastAPI espera esto)
      const res = await fetch("http://localhost:8000/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      // Si hay error de credenciales
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Credenciales incorrectas");
      }

      // Login correcto
      const data: LoginResponse = await res.json();

      // Llamamos al contexto para guardar token y redirigir
      login(data.access_token);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg w-80"
      >
        <h1 className="text-2xl font-bold mb-4 text-center text-green-600">
          Iniciar Sesión
        </h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;
