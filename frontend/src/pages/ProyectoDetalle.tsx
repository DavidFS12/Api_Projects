import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Gasto {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  p_unitario: number;
  p_total: number;
  categoria: string;
}

const ProyectoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [nuevoGasto, setNuevoGasto] = useState({
    nombre: "",
    descripcion: "",
    cantidad: 0,
    p_unitario: 0,
    categoria: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://localhost:8000/proyectos/${id}/gastos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setGastos(data));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoGasto({ ...nuevoGasto, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`http://localhost:8000/proyectos/${id}/gastos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoGasto),
    })
      .then((res) => res.json())
      .then((gastoCreado) => {
        setGastos([...gastos, gastoCreado]);
        setNuevoGasto({
          nombre: "",
          descripcion: "",
          cantidad: 0,
          p_unitario: 0,
          categoria: "",
        });
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Gastos del proyecto {id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gastos.length > 0 ? (
            <ul className="space-y-3">
              {gastos.map((g) => (
                <li
                  key={g.id}
                  className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-lg">{g.nombre}</p>
                    <p className="text-sm text-gray-600">{g.descripcion}</p>
                    <p className="text-sm text-gray-500">
                      {g.cantidad} x {g.p_unitario} ={" "}
                      <span className="font-semibold">{g.p_total}</span>
                    </p>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                      {g.categoria}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay gastos aun.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Agregar nuevos gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                name="nombre"
                placeholder="Nombre"
                value={nuevoGasto.nombre}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripcion</Label>
              <Input
                name="descripcion"
                placeholder="Descripcion"
                value={nuevoGasto.descripcion}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  name="cantidad"
                  placeholder="Cantidad"
                  value={nuevoGasto.cantidad}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="p_unitario">Precio Unitario</Label>
                <Input
                  name="p_unitario"
                  placeholder="Precio Unitario"
                  value={nuevoGasto.p_unitario}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                name="categoria"
                placeholder="Categoria"
                value={nuevoGasto.categoria}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full">
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProyectoDetalle;
