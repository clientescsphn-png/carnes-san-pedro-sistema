import { GoogleSheetsProvider } from '@/store/GoogleSheetsContext';
import { SelectorFecha } from '@/components/SelectorFecha';
import { FormularioVentas } from '@/components/FormularioVentas';
import { ResumenDia } from '@/components/ResumenDia';
import { Dashboard } from '@/components/Dashboard';
import { ExportarExcel } from '@/components/ExportarExcel';
import { GoogleSheetsConfig } from '@/components/GoogleSheetsConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { 
  PlusCircle, 
  BarChart3, 
  FileSpreadsheet,
  ShoppingBag,
  Cloud
} from 'lucide-react';

function App() {
  return (
    <GoogleSheetsProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Ventas</h1>
                <p className="text-sm text-gray-500">Gestión de Chorizo y Carne Molida</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs defaultValue="registrar" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit mb-6">
              <TabsTrigger value="registrar" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Registrar</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="exportar" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </TabsTrigger>
              <TabsTrigger value="sincronizar" className="gap-2">
                <Cloud className="h-4 w-4" />
                <span className="hidden sm:inline">Nube</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Registrar Ventas */}
            <TabsContent value="registrar" className="space-y-6">
              <SelectorFecha />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormularioVentas />
                <ResumenDia />
              </div>
            </TabsContent>

            {/* Tab: Dashboard */}
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>

            {/* Tab: Exportar */}
            <TabsContent value="exportar">
              <div className="max-w-2xl mx-auto">
                <ExportarExcel />
              </div>
            </TabsContent>

            {/* Tab: Sincronizar */}
            <TabsContent value="sincronizar">
              <div className="max-w-2xl mx-auto">
                <GoogleSheetsConfig />
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500">
              Sistema de Ventas - Los datos se guardan automáticamente en el navegador y en Google Sheets
            </p>
          </div>
        </footer>
      </div>
      <Toaster position="top-right" richColors />
    </GoogleSheetsProvider>
  );
}

export default App;
