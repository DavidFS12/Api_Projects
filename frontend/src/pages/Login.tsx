// src/pages/Login.tsx
import React, { useState, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const body = new URLSearchParams();
      body.append("username", email); // 👈 FastAPI espera 'username'
      body.append("password", password);

      const res = await axios.post<LoginResponse>(
        "http://localhost:8000/login/",
        body,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          (err.response?.data as any)?.detail ?? "Credenciales incorrectas"
        );
      } else {
        setError("Error inesperado");
      }
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
