import { jsx as _jsx } from "react/jsx-runtime";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "@/context/AuthContext";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(Router, { children: _jsx(AuthProvider, { children: _jsx(App, {}) }) }));
