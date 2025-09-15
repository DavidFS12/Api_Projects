import React, { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/codeman-1.png";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Credenciales incorrectas");
      }

      const data: LoginResponse = await res.json();
      login(data.access_token);

      // 👉 Aquí activamos animación de salida
      setIsExiting(true);

      // Navegamos cuando termine la animación (0.6s)
      setTimeout(() => {
        navigate("/proyectos"); // cambia a tu ruta real
      }, 600);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#000051]">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-80 max-sm:mx-4 sm:mx-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          isExiting
            ? { opacity: 0, scale: 0.5, y: -100 }
            : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <h1 className="text-3xl font-bold mb-4 text-center text-[#000051]">
          Iniciar Sesión
        </h1>
        <img
          src={logo}
          alt="codeman logo"
          className="mx-auto mb-4 w-32 h-auto"
        />
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
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="w-full py-2 rounded-lg text-white font-semibold bg-[#001194] hover:bg-[#000051]"
        >
          Entrar
        </button>
      </motion.form>
    </div>
  );
};

export default Login;
