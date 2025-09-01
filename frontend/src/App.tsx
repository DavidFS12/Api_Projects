import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardProyectos from "./pages/DashboardProyectos";
import Layout from "./components/Layout";
import PrivateRoute from "@/components/PrivateRoute";
import ProyectoDetalle from "./pages/ProyectoDetalle";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route
          path="/proyectos"
          element={
            <PrivateRoute>
              <DashboardProyectos />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="/proyectos/:id" element={<ProyectoDetalle />} />
    </Routes>
  );
}

export default App;
