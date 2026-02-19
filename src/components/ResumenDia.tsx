import { useGoogleSheets } from "@/store/GoogleSheetsContext";
import type { TipoPaquete } from "@/types";
import { NOMBRES_PAQUETE } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, TrendingUp, Package, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* 🔥 Formateador de moneda local */
const formatLempira = (valor: number) => {
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
  }).format(valor);
};

export function ResumenDia() {
  const { state, obtenerVentasPorDia, eliminarVenta, obtenerTotalPorDia } =
    useGoogleSheets();

  const ventasDia = obtenerVentasPorDia(
    state.mesSeleccionado,
    state.semanaSeleccionada,
    state.diaSeleccionado,
  );

  const totalDia = obtenerTotalPorDia(
    state.mesSeleccionado,
    state.semanaSeleccionada,
    state.diaSeleccionado,
  );

  const handleEliminar = (id: string) => {
    eliminarVenta(id);
    toast.success("Venta eliminada");
  };

  const ventasAgrupadas = ventasDia.reduce(
    (acc, venta) => {
      const key = `${venta.producto}-${venta.paquete}`;

      if (!acc[key]) {
        acc[key] = {
          producto: venta.producto,
          paquete: venta.paquete,
          unidades: 0,
          total: 0,
          id: venta.id,
        };
      }

      acc[key].unidades += venta.unidades;
      acc[key].total += venta.total;

      return acc;
    },
    {} as Record<
      string,
      {
        producto: string;
        paquete: TipoPaquete;
        unidades: number;
        total: number;
        id: string;
      }
    >,
  );

  const ventasArray = Object.values(ventasAgrupadas);

  const totalChorizo = ventasDia
    .filter((v) => v.producto === "chorizo")
    .reduce((sum, v) => sum + v.total, 0);

  const totalCarneMolida = ventasDia
    .filter((v) => v.producto === "carne_molida")
    .reduce((sum, v) => sum + v.total, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Resumen del Día
          </CardTitle>

          <Badge variant="secondary" className="text-sm font-semibold">
            {formatLempira(totalDia)}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{state.mesSeleccionado}</span>
          <span>•</span>
          <span>Semana {state.semanaSeleccionada}</span>
          <span>•</span>
          <span>{state.diaSeleccionado}</span>
        </div>
      </CardHeader>

      <CardContent>
        {ventasArray.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay ventas registradas para este día</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[250px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead className="text-right">Unid.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {ventasArray.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell>
                        <Badge
                          variant={
                            venta.producto === "chorizo"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {venta.producto === "chorizo" ? "Chorizo" : "Carne"}
                        </Badge>
                      </TableCell>

                      <TableCell>{NOMBRES_PAQUETE[venta.paquete]}</TableCell>

                      <TableCell className="text-right">
                        {venta.unidades}
                      </TableCell>

                      <TableCell className="text-right font-medium">
                        {formatLempira(venta.total)}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => handleEliminar(venta.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Chorizo
                </div>
                <div className="text-xl font-bold text-amber-800">
                  {formatLempira(totalChorizo)}
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Carne Molida
                </div>
                <div className="text-xl font-bold text-red-800">
                  {formatLempira(totalCarneMolida)}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
