import { useState, useEffect } from 'react';
import { useGoogleSheets } from '@/store/GoogleSheetsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Cloud, 
  CloudOff, 
  LogIn, 
  LogOut, 
  Plus, 
  Link as LinkIcon, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export function GoogleSheetsConfig() {
  const {
    isInitialized,
    isAuthenticated,
    isSyncing,
    spreadsheetId,
    userEmail,
    initialize,
    signIn,
    signOut,
    createSpreadsheet,
    connectToSpreadsheet,
    syncWithSheets,
  } = useGoogleSheets();

  const [newSheetTitle, setNewSheetTitle] = useState('Ventas 2026');
  const [existingSheetId, setExistingSheetId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Inicializar Google API al montar
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn();
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCreateSpreadsheet = async () => {
    setIsLoading(true);
    const id = await createSpreadsheet(newSheetTitle);
    setIsLoading(false);
    if (id) {
      setDialogOpen(false);
    }
  };

  const handleConnectSpreadsheet = () => {
    if (!existingSheetId.trim()) {
      toast.error('Ingresa un ID válido');
      return;
    }
    connectToSpreadsheet(existingSheetId.trim());
    setExistingSheetId('');
    setDialogOpen(false);
  };

  const handleSync = async () => {
    await syncWithSheets();
  };

  // Extraer ID de URL de Google Sheets
  const extractIdFromUrl = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const handleUrlPaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    const extractedId = extractIdFromUrl(pastedText);
    if (extractedId) {
      setExistingSheetId(extractedId);
      e.preventDefault();
      toast.success('ID extraído de la URL');
    }
  };

  // Estado de conexión
  const getConnectionStatus = () => {
    if (!isAuthenticated) {
      return { label: 'No conectado', variant: 'secondary' as const, icon: CloudOff };
    }
    if (spreadsheetId) {
      return { label: 'Sincronizado', variant: 'default' as const, icon: CheckCircle };
    }
    return { label: 'Conectado (sin hoja)', variant: 'outline' as const, icon: Cloud };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Sincronización con Google Sheets</CardTitle>
          </div>
          <Badge variant={status.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
        <CardDescription>
          Guarda tus ventas en la nube y accede desde cualquier dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isAuthenticated ? (
          <div className="text-center py-6 space-y-4">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <CloudOff className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-600 mb-1">No has iniciado sesión con Google</p>
              <p className="text-sm text-gray-400">
                Inicia sesión para sincronizar tus datos con Google Sheets
              </p>
            </div>
            <Button 
              onClick={handleSignIn} 
              disabled={isLoading || !isInitialized}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? 'Conectando...' : 'Iniciar sesión con Google'}
            </Button>
            {!isInitialized && (
              <p className="text-xs text-amber-600">
                Inicializando Google API...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Info de usuario */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Conectado</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>

            {/* Estado de la hoja */}
            {spreadsheetId ? (
              <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <LinkIcon className="h-4 w-4" />
                  <span className="font-medium text-sm">Hoja conectada</span>
                </div>
                <p className="text-xs text-gray-500 font-mono break-all">
                  {spreadsheetId}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="gap-1 flex-1"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium text-sm">Sin hoja de cálculo</span>
                </div>
                <p className="text-xs text-gray-500">
                  Crea una nueva hoja o conecta una existente para sincronizar tus datos
                </p>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Conectar hoja de cálculo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Conectar Google Sheets</DialogTitle>
                      <DialogDescription>
                        Crea una nueva hoja o conecta una existente
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="new" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="new">Nueva hoja</TabsTrigger>
                        <TabsTrigger value="existing">Hoja existente</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="new" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Nombre de la hoja</Label>
                          <Input
                            id="title"
                            value={newSheetTitle}
                            onChange={(e) => setNewSheetTitle(e.target.value)}
                            placeholder="Ventas 2026"
                          />
                        </div>
                        <Button 
                          onClick={handleCreateSpreadsheet}
                          disabled={isLoading || !newSheetTitle.trim()}
                          className="w-full gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {isLoading ? 'Creando...' : 'Crear hoja'}
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="existing" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="sheetId">ID de la hoja</Label>
                          <Input
                            id="sheetId"
                            value={existingSheetId}
                            onChange={(e) => setExistingSheetId(e.target.value)}
                            onPaste={handleUrlPaste}
                            placeholder="Pega la URL o el ID"
                          />
                          <p className="text-xs text-gray-500">
                            Puedes pegar la URL completa de Google Sheets
                          </p>
                        </div>
                        <Button 
                          onClick={handleConnectSpreadsheet}
                          disabled={!existingSheetId.trim()}
                          className="w-full gap-2"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Conectar
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
