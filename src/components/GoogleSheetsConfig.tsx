import { useGoogleSheets } from "@/store/GoogleSheetsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

export function GoogleSheetsConfig() {
  const {
    isInitialized,
    isAuthenticated,
    spreadsheetId,
    initialize,
    signIn,
    signOut,
    createSpreadsheet,
    connectToSpreadsheet,
  } = useGoogleSheets();

  const [newSpreadsheetId, setNewSpreadsheetId] = useState("");

  const handleInitialize = async () => {
    await initialize();
    toast.success("Inicializado");
  };

  const handleSignIn = async () => {
    const success = await signIn();
    if (success) toast.success("Sesión iniciada");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sesión cerrada");
  };

  const handleCreateSpreadsheet = async () => {
    const id = await createSpreadsheet("Ventas Carnes San Pedro");
    if (id) toast.success("Hoja creada");
  };

  const handleConnectSpreadsheet = () => {
    if (!newSpreadsheetId) return;
    connectToSpreadsheet(newSpreadsheetId);
    toast.success("Hoja conectada");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuración Google Sheets</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isInitialized && (
          <Button onClick={handleInitialize}>Inicializar Google API</Button>
        )}

        {isInitialized && !isAuthenticated && (
          <Button onClick={handleSignIn}>Iniciar sesión con Google</Button>
        )}

        {isAuthenticated && (
          <>
            <Button variant="destructive" onClick={handleSignOut}>
              Cerrar sesión
            </Button>

            <Button onClick={handleCreateSpreadsheet}>Crear nueva hoja</Button>

            <div className="space-y-2">
              <Input
                placeholder="ID de hoja existente"
                value={newSpreadsheetId}
                onChange={(e) => setNewSpreadsheetId(e.target.value)}
              />
              <Button onClick={handleConnectSpreadsheet}>
                Conectar hoja existente
              </Button>
            </div>

            {spreadsheetId && (
              <p className="text-sm text-gray-500">
                Hoja conectada: {spreadsheetId}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
