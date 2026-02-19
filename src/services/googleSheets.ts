import type { VentaDia } from "@/types";
import { GOOGLE_CONFIG, isGoogleConfigValid } from "@/config/google";

const CLIENT_ID = GOOGLE_CONFIG.CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let SPREADSHEET_ID: string | null = null;
let accessToken: string | null = null;
let tokenClient: any = null;

declare global {
  interface Window {
    google: any;
  }
}

export class GoogleSheetsService {
  private isAuthenticated = false;

  async initialize(): Promise<boolean> {
    if (!isGoogleConfigValid()) return false;
    if (!window.google) return false;

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (!response.error) {
          accessToken = response.access_token;
          this.isAuthenticated = true;
        }
      },
    });

    return true;
  }

  isSignedIn(): boolean {
    return this.isAuthenticated;
  }

  getUserEmail(): string | null {
    return null;
  }

  async signOut(): Promise<void> {
    accessToken = null;
    this.isAuthenticated = false;
  }

  async signIn(): Promise<boolean> {
    if (!tokenClient) return false;

    return new Promise((resolve) => {
      tokenClient.callback = (response: any) => {
        if (response.error) {
          resolve(false);
        } else {
          accessToken = response.access_token;
          this.isAuthenticated = true;
          resolve(true);
        }
      };

      tokenClient.requestAccessToken();
    });
  }

  async createSpreadsheet(title: string): Promise<string | null> {
    if (!accessToken) return null;

    const response = await fetch(
      "https://sheets.googleapis.com/v4/spreadsheets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: { title },
          sheets: [
            { properties: { title: "Ventas" } },
            { properties: { title: "Precios" } },
            { properties: { title: "Config" } },
          ],
        }),
      },
    );

    if (!response.ok) {
      console.error("Error creando spreadsheet");
      return null;
    }

    const data = await response.json();
    SPREADSHEET_ID = data.spreadsheetId;

    return SPREADSHEET_ID;
  }

  connectToSpreadsheet(spreadsheetId: string): boolean {
    SPREADSHEET_ID = spreadsheetId;
    return true;
  }

  async guardarVenta(venta: VentaDia): Promise<boolean> {
    if (!SPREADSHEET_ID || !accessToken) return false;

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Ventas!A1:append?valueInputOption=RAW`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [
            [
              venta.id,
              venta.mes,
              venta.semana,
              venta.dia,
              venta.producto,
              venta.paquete,
              venta.unidades,
              venta.precioUnitario,
              venta.total,
              venta.fechaRegistro,
            ],
          ],
        }),
      },
    );

    return response.ok;
  }
}

export const googleSheetsService = new GoogleSheetsService();
