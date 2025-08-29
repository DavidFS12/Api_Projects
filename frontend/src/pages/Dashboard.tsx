import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-green-600">
        Bienvenido al Dashboard
      </h1>
      <p className="mt-2 text-gray-700">
        Aquí irán las métricas principales de tu sistema.
      </p>
    </div>
  );
};

export default Dashboard;
