import { useGoogleSheets } from '@/store/GoogleSheetsContext';
import type { TipoPaquete } from '@/types';
import { MESES, NOMBRES_PAQUETE } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const PAQUETES: TipoPaquete[] = [
  'detalle_1_2',
  'mayoreo_1_2',
  'paquete_4_onz',
  'paquete_4_onz_mayoreo',
  'distribuidor',
  'distribuido_4_onzas',
];

export function ExportarExcel() {
  const { state, obtenerTotalPorMes } = useGoogleSheets();

  const generarExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // 1. Hoja de Balance General (igual a tu Excel original)
      const balanceGeneralData = [
        ['Balance General'],
        [''],
        ['', 'Chorizo', 'Carne Molida', 'Total Ingreso'],
        ...MESES.map(mes => {
          const ventasMes = state.ventas.filter(v => v.mes === mes);
          const chorizo = ventasMes
            .filter(v => v.producto === 'chorizo')
            .reduce((sum, v) => sum + v.total, 0);
          const carneMolida = ventasMes
            .filter(v => v.producto === 'carne_molida')
            .reduce((sum, v) => sum + v.total, 0);
          return [mes, chorizo, carneMolida, chorizo + carneMolida];
        }),
        ['', 
          MESES.reduce((sum, mes) => {
            const ventasMes = state.ventas.filter(v => v.mes === mes && v.producto === 'chorizo');
            return sum + ventasMes.reduce((s, v) => s + v.total, 0);
          }, 0),
          MESES.reduce((sum, mes) => {
            const ventasMes = state.ventas.filter(v => v.mes === mes && v.producto === 'carne_molida');
            return sum + ventasMes.reduce((s, v) => s + v.total, 0);
          }, 0),
          MESES.reduce((sum, mes) => sum + obtenerTotalPorMes(mes), 0)
        ],
      ];
      const wsBalance = XLSX.utils.aoa_to_sheet(balanceGeneralData);
      XLSX.utils.book_append_sheet(wb, wsBalance, 'Balance General');

      // 2. Hojas de Balance Mensual por producto
      ['chorizo', 'carne_molida'].forEach(producto => {
        const nombreProducto = producto === 'chorizo' ? 'Chorizo' : 'Carne Molida';
        
        MESES.forEach(mes => {
          const semanasData = [1, 2, 3, 4, 5].map(semana => {
            const ventasSemana = state.ventas.filter(
              v => v.mes === mes && v.semana === semana && v.producto === producto
            );
            return ventasSemana.reduce((sum, v) => sum + v.total, 0);
          });
          
          const mesData = [
            [`Balance Mensual ${nombreProducto} - ${mes}`],
            [''],
            ['', 'Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5'],
            ['', ...semanasData],
            [''],
            ['', '', '', '', 'Total', semanasData.reduce((a, b) => a + b, 0)],
          ];
          
          const wsMes = XLSX.utils.aoa_to_sheet(mesData);
          XLSX.utils.book_append_sheet(wb, wsMes, `${nombreProducto.substring(0, 3)} ${mes.substring(0, 3)}`);
        });
      });

      // 3. Hoja de Registro Detallado
      const registroData = [
        ['Registro Detallado de Ventas'],
        [''],
        ['Fecha Registro', 'Mes', 'Semana', 'Día', 'Producto', 'Paquete', 'Unidades', 'Precio Unit.', 'Total'],
        ...state.ventas.map(v => [
          new Date(v.fechaRegistro).toLocaleString('es-MX'),
          v.mes,
          v.semana,
          v.dia,
          v.producto === 'chorizo' ? 'Chorizo' : 'Carne Molida',
          NOMBRES_PAQUETE[v.paquete],
          v.unidades,
          v.precioUnitario,
          v.total,
        ]),
      ];
      const wsRegistro = XLSX.utils.aoa_to_sheet(registroData);
      XLSX.utils.book_append_sheet(wb, wsRegistro, 'Registro Detallado');

      // 4. Hoja de Configuración de Precios
      const preciosData = [
        ['Configuración de Precios'],
        [''],
        ['Paquete', 'Chorizo', 'Carne Molida'],
        ...PAQUETES.map(paquete => [
          NOMBRES_PAQUETE[paquete],
          state.precios.chorizo[paquete],
          state.precios.carne_molida[paquete],
        ]),
      ];
      const wsPrecios = XLSX.utils.aoa_to_sheet(preciosData);
      XLSX.utils.book_append_sheet(wb, wsPrecios, 'Precios');

      // Descargar
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Reporte_Ventas_${fecha}.xlsx`);
      
      toast.success('Excel exportado correctamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el Excel');
    }
  };

  const generarExcelSemanal = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Hoja del mes actual con detalle por semanas y días
      const mesActual = state.mesSeleccionado;
      
      ['chorizo', 'carne_molida'].forEach(producto => {
        const nombreProducto = producto === 'chorizo' ? 'Chorizo' : 'Carne Molida';
        const datosSemanas: (string | number)[][] = [];
        
        // Encabezados de semanas
        const encabezados = [''];
        for (let semana = 1; semana <= 5; semana++) {
          encabezados.push(`Semana ${semana}`, '', '', '', '', '', '');
        }
        datosSemanas.push(encabezados);
        
        // Sub-encabezados de días
        const subEncabezados = ['Paquete'];
        for (let semana = 1; semana <= 5; semana++) {
          ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach(dia => {
            subEncabezados.push(dia);
          });
        }
        datosSemanas.push(subEncabezados);
        
        // Datos por paquete
        PAQUETES.forEach(paquete => {
          const fila: (string | number)[] = [NOMBRES_PAQUETE[paquete]];
          
          for (let semana = 1; semana <= 5; semana++) {
            ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].forEach(dia => {
              const venta = state.ventas.find(
                v => v.mes === mesActual && 
                     v.semana === semana && 
                     v.dia === dia && 
                     v.producto === producto && 
                     v.paquete === paquete
              );
              fila.push(venta ? venta.unidades : 0);
            });
          }
          
          datosSemanas.push(fila);
        });
        
        // Fila de totales diarios
        const filaTotales: (string | number)[] = ['TOTAL'];
        for (let semana = 1; semana <= 5; semana++) {
          ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].forEach(dia => {
            const totalDia = state.ventas
              .filter(v => v.mes === mesActual && v.semana === semana && v.dia === dia && v.producto === producto)
              .reduce((sum, v) => sum + v.total, 0);
            filaTotales.push(totalDia);
          });
        }
        datosSemanas.push(filaTotales);
        
        const ws = XLSX.utils.aoa_to_sheet([
          [`Reporte ${nombreProducto} - ${mesActual}`],
          [''],
          ...datosSemanas,
        ]);
        XLSX.utils.book_append_sheet(wb, ws, nombreProducto);
      });

      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Reporte_Semanal_${mesActual}_${fecha}.xlsx`);
      
      toast.success('Excel semanal exportado correctamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el Excel');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          Exportar a Excel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Reporte Completo</h4>
            <p className="text-sm text-gray-500 mb-3">
              Exporta todos los datos: Balance General, Balances Mensuales, Registro Detallado y Precios.
            </p>
            <Button 
              onClick={generarExcel} 
              className="w-full gap-2"
              variant="default"
            >
              <Download className="h-4 w-4" />
              Descargar Reporte Completo
            </Button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Reporte Semanal</h4>
            <p className="text-sm text-gray-500 mb-3">
              Exporta el detalle semanal del mes seleccionado ({state.mesSeleccionado}).
            </p>
            <Button 
              onClick={generarExcelSemanal} 
              className="w-full gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Descargar Reporte Semanal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
