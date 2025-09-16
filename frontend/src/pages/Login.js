import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/codeman-1.png";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isExiting, setIsExiting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
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
            const data = await res.json();
            login(data.access_token);
            // 👉 Aquí activamos animación de salida
            setIsExiting(true);
            // Navegamos cuando termine la animación (0.6s)
            setTimeout(() => {
                navigate("/proyectos"); // cambia a tu ruta real
            }, 600);
        }
        catch (err) {
            setError(err.message || "Error inesperado");
        }
    };
    return (_jsx("div", { className: "h-screen w-full flex items-center justify-center bg-[#000051]", children: _jsxs(motion.form, { onSubmit: handleSubmit, className: "bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-80 max-sm:mx-4 sm:mx-0", initial: { opacity: 0, scale: 0.8 }, animate: isExiting
                ? { opacity: 0, scale: 0.5, y: -100 }
                : { opacity: 1, scale: 1 }, transition: { duration: 0.6, ease: "easeInOut" }, children: [_jsx("h1", { className: "text-3xl font-bold mb-4 text-center text-[#000051]", children: "Iniciar Sesi\u00F3n" }), _jsx("img", { src: logo, alt: "codeman logo", className: "mx-auto mb-4 w-32 h-auto" }), error && _jsx("p", { className: "text-red-500 mb-2", children: error }), _jsx("input", { type: "email", placeholder: "Correo", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full p-2 border rounded mb-3", required: true }), _jsx("input", { type: "password", placeholder: "Contrase\u00F1a", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full p-2 border rounded mb-3", required: true, autoComplete: "current-password" }), _jsx("button", { type: "submit", className: "w-full py-2 rounded-lg text-white font-semibold bg-[#001194] hover:bg-[#000051]", children: "Entrar" })] }) }));
};
export default Login;
