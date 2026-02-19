import { useMemo } from "react";
import { useGoogleSheets } from "@/store/GoogleSheetsContext";
import { MESES } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatLempira } from "@/lib/utils";

const COLORS = ["#f59e0b", "#ef4444"];

export function Dashboard() {
  const {
    state,
    obtenerTotalPorMes,
    obtenerTotalPorSemana,
    obtenerTotalesAnuales,
  } = useGoogleSheets();

  // 🔥 Totales anuales reactivos
  const totalesAnuales = useMemo(() => {
    return obtenerTotalesAnuales();
  }, [state.ventas]);

  // 🔥 Datos mensuales reactivos
  const datosMensuales = useMemo(() => {
    return MESES.map((mes) => {
      const totalMes = obtenerTotalPorMes(mes);
      const ventasMes = state.ventas.filter((v) => v.mes === mes);

      const chorizo = ventasMes
        .filter((v) => v.producto === "chorizo")
        .reduce((sum, v) => sum + v.total, 0);

      const carneMolida = ventasMes
        .filter((v) => v.producto === "carne_molida")
        .reduce((sum, v) => sum + v.total, 0);

      return {
        mes: mes.substring(0, 3),
        total: totalMes,
        chorizo,
        carneMolida,
      };
    });
  }, [state.ventas]);

  // 🔥 Datos por semanas reactivos
  const datosSemanas = useMemo(() => {
    return [1, 2, 3, 4, 5].map((semana) => {
      const totalSemana = obtenerTotalPorSemana(state.mesSeleccionado, semana);
      const ventasSemana = state.ventas.filter(
        (v) => v.mes === state.mesSeleccionado && v.semana === semana,
      );

      const chorizo = ventasSemana
        .filter((v) => v.producto === "chorizo")
        .reduce((sum, v) => sum + v.total, 0);

      const carneMolida = ventasSemana
        .filter((v) => v.producto === "carne_molida")
        .reduce((sum, v) => sum + v.total, 0);

      return {
        semana,
        total: totalSemana,
        chorizo,
        carneMolida,
      };
    });
  }, [state.ventas, state.mesSeleccionado]);

  const totalMesActual = useMemo(() => {
    return obtenerTotalPorMes(state.mesSeleccionado);
  }, [state.ventas, state.mesSeleccionado]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Ventas Anuales</p>
            <p className="text-2xl font-bold">
              {formatLempira(totalesAnuales.total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">
              Mes Actual ({state.mesSeleccionado})
            </p>
            <p className="text-2xl font-bold">
              {formatLempira(totalMesActual)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Registros</p>
            <p className="text-2xl font-bold">{state.ventas.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="mensual">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mensual">
            <BarChart3 className="h-4 w-4 mr-2" />
            Mensual
          </TabsTrigger>
          <TabsTrigger value="producto">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Por Producto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mensual" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosMensuales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatLempira(value)}
                    />
                    <Legend />
                    <Bar dataKey="chorizo" fill="#f59e0b" />
                    <Bar dataKey="carneMolida" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="producto" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Chorizo", value: totalesAnuales.chorizo },
                        {
                          name: "Carne Molida",
                          value: totalesAnuales.carne_molida,
                        },
                      ]}
                      dataKey="value"
                      outerRadius={100}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={index} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatLempira(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tabla semanas */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Semanas - {state.mesSeleccionado}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semana</TableHead>
                  <TableHead className="text-right">Chorizo</TableHead>
                  <TableHead className="text-right">Carne Molida</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datosSemanas.map((semana) => (
                  <TableRow key={semana.semana}>
                    <TableCell>Semana {semana.semana}</TableCell>
                    <TableCell className="text-right">
                      {formatLempira(semana.chorizo)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatLempira(semana.carneMolida)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatLempira(semana.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
