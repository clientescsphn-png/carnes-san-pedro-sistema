import { useGoogleSheets } from '@/store/GoogleSheetsContext';
import { MESES, SEMANAS, DIAS_SEMANA } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export function SelectorFecha() {
  const { state, setMes, setSemana, setDia } = useGoogleSheets();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Seleccionar Período
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selector de Mes */}
          <div className="space-y-2">
            <Label htmlFor="mes" className="text-sm font-medium">
              Mes
            </Label>
            <Select value={state.mesSeleccionado} onValueChange={(v) => setMes(v as typeof MESES[number])}>
              <SelectTrigger id="mes" className="w-full">
                <SelectValue placeholder="Selecciona mes" />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((mes) => (
                  <SelectItem key={mes} value={mes}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Semana */}
          <div className="space-y-2">
            <Label htmlFor="semana" className="text-sm font-medium">
              Semana
            </Label>
            <Select 
              value={state.semanaSeleccionada.toString()} 
              onValueChange={(v) => setSemana(parseInt(v))}
            >
              <SelectTrigger id="semana" className="w-full">
                <SelectValue placeholder="Selecciona semana" />
              </SelectTrigger>
              <SelectContent>
                {SEMANAS.map((semana) => (
                  <SelectItem key={semana} value={semana.toString()}>
                    Semana {semana}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Día */}
          <div className="space-y-2">
            <Label htmlFor="dia" className="text-sm font-medium">
              Día
            </Label>
            <Select 
              value={state.diaSeleccionado} 
              onValueChange={(v) => setDia(v as typeof DIAS_SEMANA[number])}
            >
              <SelectTrigger id="dia" className="w-full">
                <SelectValue placeholder="Selecciona día" />
              </SelectTrigger>
              <SelectContent>
                {DIAS_SEMANA.map((dia) => (
                  <SelectItem key={dia} value={dia}>
                    {dia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
