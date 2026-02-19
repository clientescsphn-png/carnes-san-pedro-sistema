import { useState } from "react";
import { useGoogleSheets } from "@/store/GoogleSheetsContext";
import type { TipoProducto, TipoPaquete } from "@/types";
import { NOMBRES_PAQUETE } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const PAQUETES: TipoPaquete[] = [
  "detalle_1_2",
  "mayoreo_1_2",
  "paquete_4_onz",
  "paquete_4_onz_mayoreo",
  "distribuidor",
  "distribuido_4_onzas",
];

interface FormularioProductoProps {
  producto: TipoProducto;
  titulo: string;
  color: string;
}

function FormularioProducto({
  producto,
  titulo,
  color,
}: FormularioProductoProps) {
  const { state, agregarVenta, actualizarPrecio } = useGoogleSheets();

  const [unidades, setUnidades] = useState<Record<TipoPaquete, string>>({
    detalle_1_2: "",
    mayoreo_1_2: "",
    paquete_4_onz: "",
    paquete_4_onz_mayoreo: "",
    distribuidor: "",
    distribuido_4_onzas: "",
  });

  const handleUnidadChange = (paquete: TipoPaquete, valor: string) => {
    setUnidades((prev) => ({ ...prev, [paquete]: valor }));
  };

  const handlePrecioChange = (paquete: TipoPaquete, valor: string) => {
    const precio = parseFloat(valor) || 0;
    actualizarPrecio(producto, paquete, precio);
  };

  const handleAgregarVenta = () => {
    let ventasAgregadas = 0;

    PAQUETES.forEach((paquete) => {
      const cantidad = parseInt(unidades[paquete]) || 0;
      if (cantidad > 0) {
        const precioUnitario = state.precios[producto][paquete];

        agregarVenta({
          mes: state.mesSeleccionado,
          semana: state.semanaSeleccionada,
          dia: state.diaSeleccionado,
          producto,
          paquete,
          unidades: cantidad,
          precioUnitario,
          total: cantidad * precioUnitario,
        });

        ventasAgregadas++;
      }
    });

    if (ventasAgregadas > 0) {
      toast.success(`Se agregaron ${ventasAgregadas} registros de venta`);
      setUnidades({
        detalle_1_2: "",
        mayoreo_1_2: "",
        paquete_4_onz: "",
        paquete_4_onz_mayoreo: "",
        distribuidor: "",
        distribuido_4_onzas: "",
      });
    } else {
      toast.warning("No se ingresaron unidades para registrar");
    }
  };

  const totalCalculado = PAQUETES.reduce((sum, paquete) => {
    const cantidad = parseInt(unidades[paquete]) || 0;
    const precio = state.precios[producto][paquete];
    return sum + cantidad * precio;
  }, 0);

  const hayUnidadesIngresadas = PAQUETES.some(
    (paquete) => (parseInt(unidades[paquete]) || 0) > 0,
  );

  // 🔥 Función para nombre visible
  const nombreVisible = (paquete: TipoPaquete) => {
    if (paquete === "distribuidor") return "Distribuidor 1/2";
    return NOMBRES_PAQUETE[paquete];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${color}`}>{titulo}</h3>
        <Badge variant="outline" className="text-sm">
          {state.mesSeleccionado} - Sem {state.semanaSeleccionada} -{" "}
          {state.diaSeleccionado}
        </Badge>
      </div>

      <div className="space-y-3">
        {PAQUETES.map((paquete) => (
          <div
            key={paquete}
            className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="col-span-5">
              <Label className="text-sm font-medium">
                {nombreVisible(paquete)}
              </Label>
            </div>

            {/* Precio */}
            <div className="col-span-3">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  L.
                </span>
                <Input
                  type="number"
                  placeholder="Precio"
                  value={state.precios[producto][paquete] || ""}
                  onChange={(e) => handlePrecioChange(paquete, e.target.value)}
                  className="pl-8 h-9"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Unidades */}
            <div className="col-span-4">
              <div className="relative">
                <Package className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Unidades"
                  value={unidades[paquete]}
                  onChange={(e) => handleUnidadChange(paquete, e.target.value)}
                  className="pl-8 h-9"
                  min="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm">
          <span className="text-gray-500">Total estimado: </span>
          <span className="font-semibold text-lg">
            {new Intl.NumberFormat("es-HN", {
              style: "currency",
              currency: "HNL",
            }).format(totalCalculado)}
          </span>
        </div>

        <Button
          onClick={handleAgregarVenta}
          disabled={!hayUnidadesIngresadas}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar Venta
        </Button>
      </div>
    </div>
  );
}

export function FormularioVentas() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          Registrar Ventas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chorizo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chorizo">Chorizo</TabsTrigger>
            <TabsTrigger value="carne_molida">Carne Molida</TabsTrigger>
          </TabsList>

          <TabsContent value="chorizo" className="mt-4">
            <FormularioProducto
              producto="chorizo"
              titulo="Chorizo"
              color="text-amber-700"
            />
          </TabsContent>

          <TabsContent value="carne_molida" className="mt-4">
            <FormularioProducto
              producto="carne_molida"
              titulo="Carne Molida"
              color="text-red-700"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
