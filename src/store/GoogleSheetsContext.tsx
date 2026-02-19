import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from "react";

import type {
  VentaDia,
  Mes,
  DiaSemana,
  TipoProducto,
  TipoPaquete,
  AppState,
} from "@/types";

import { MESES, DIAS_SEMANA, PRECIOS_DEFAULT } from "@/types";
import { googleSheetsService } from "@/services/googleSheets";
import { toast } from "sonner";

/* ===========================
   ESTADO INICIAL
=========================== */

const initialState: AppState = {
  ventas: [],
  precios: {
    chorizo: { ...PRECIOS_DEFAULT },
    carne_molida: { ...PRECIOS_DEFAULT },
  },
  mesSeleccionado: MESES[new Date().getMonth()],
  semanaSeleccionada: 1,
  diaSeleccionado: DIAS_SEMANA[0],
};

/* ===========================
   REDUCER
=========================== */

type Action =
  | { type: "AGREGAR_VENTA"; payload: Omit<VentaDia, "id" | "fechaRegistro"> }
  | { type: "ACTUALIZAR_VENTA"; payload: VentaDia }
  | { type: "ELIMINAR_VENTA"; payload: string }
  | { type: "SET_MES"; payload: Mes }
  | { type: "SET_SEMANA"; payload: number }
  | { type: "SET_DIA"; payload: DiaSemana }
  | {
      type: "ACTUALIZAR_PRECIO";
      payload: { producto: TipoProducto; paquete: TipoPaquete; precio: number };
    }
  | { type: "LIMPIAR_DATOS" };

function ventasReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "AGREGAR_VENTA": {
      const nuevaVenta: VentaDia = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        fechaRegistro: new Date().toISOString(),
      };
      return { ...state, ventas: [...state.ventas, nuevaVenta] };
    }

    case "ACTUALIZAR_VENTA":
      return {
        ...state,
        ventas: state.ventas.map((v) =>
          v.id === action.payload.id ? action.payload : v,
        ),
      };

    case "ELIMINAR_VENTA":
      return {
        ...state,
        ventas: state.ventas.filter((v) => v.id !== action.payload),
      };

    case "SET_MES":
      return { ...state, mesSeleccionado: action.payload };

    case "SET_SEMANA":
      return { ...state, semanaSeleccionada: action.payload };

    case "SET_DIA":
      return { ...state, diaSeleccionado: action.payload };

    case "ACTUALIZAR_PRECIO": {
      const { producto, paquete, precio } = action.payload;
      return {
        ...state,
        precios: {
          ...state.precios,
          [producto]: {
            ...state.precios[producto],
            [paquete]: precio,
          },
        },
      };
    }

    case "LIMPIAR_DATOS":
      return initialState;

    default:
      return state;
  }
}

/* ===========================
   CONTEXT
=========================== */

interface GoogleSheetsContextType {
  state: AppState;
  isInitialized: boolean;
  isAuthenticated: boolean;
  spreadsheetId: string | null;

  agregarVenta: (
    venta: Omit<VentaDia, "id" | "fechaRegistro">,
  ) => Promise<void>;
  actualizarVenta: (venta: VentaDia) => Promise<void>;
  eliminarVenta: (id: string) => Promise<void>;

  setMes: (mes: Mes) => void;
  setSemana: (semana: number) => void;
  setDia: (dia: DiaSemana) => void;

  actualizarPrecio: (
    producto: TipoProducto,
    paquete: TipoPaquete,
    precio: number,
  ) => void;

  initialize: () => Promise<void>;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  createSpreadsheet: (title: string) => Promise<string | null>;
  connectToSpreadsheet: (id: string) => void;

  obtenerVentasPorDia: (mes: Mes, semana: number, dia: DiaSemana) => VentaDia[];

  obtenerVentasPorSemana: (mes: Mes, semana: number) => VentaDia[];
  obtenerVentasPorMes: (mes: Mes) => VentaDia[];

  obtenerTotalPorDia: (mes: Mes, semana: number, dia: DiaSemana) => number;

  obtenerTotalPorSemana: (mes: Mes, semana: number) => number;
  obtenerTotalPorMes: (mes: Mes) => number;

  obtenerTotalesAnuales: () => {
    chorizo: number;
    carne_molida: number;
    total: number;
  };
}

const GoogleSheetsContext = createContext<GoogleSheetsContextType | undefined>(
  undefined,
);

/* ===========================
   PROVIDER
=========================== */

export function GoogleSheetsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(ventasReducer, initialState, (init) => {
    const saved = localStorage.getItem("ventasData");
    return saved ? JSON.parse(saved) : init;
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);

  /* Guardado automático */
  useEffect(() => {
    localStorage.setItem("ventasData", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const savedId = localStorage.getItem("sheetsId");
    if (savedId) {
      setSpreadsheetId(savedId);
      googleSheetsService.connectToSpreadsheet(savedId);
    }
  }, []);

  /* ================= GOOGLE ================= */

  const initialize = useCallback(async () => {
    const success = await googleSheetsService.initialize();
    setIsInitialized(success);
    setIsAuthenticated(googleSheetsService.isSignedIn());
  }, []);

  const signIn = useCallback(async () => {
    const success = await googleSheetsService.signIn();
    if (success) {
      setIsAuthenticated(true);
      toast.success("Sesión iniciada");
    }
    return success;
  }, []);

  const signOut = useCallback(async () => {
    await googleSheetsService.signOut();
    setIsAuthenticated(false);
    setSpreadsheetId(null);
    toast.success("Sesión cerrada");
  }, []);

  const createSpreadsheet = useCallback(async (title: string) => {
    const id = await googleSheetsService.createSpreadsheet(title);
    if (id) {
      setSpreadsheetId(id);
      localStorage.setItem("sheetsId", id);
      toast.success("Hoja creada");
    }
    return id;
  }, []);

  const connectToSpreadsheet = useCallback((id: string) => {
    googleSheetsService.connectToSpreadsheet(id);
    setSpreadsheetId(id);
    localStorage.setItem("sheetsId", id);
  }, []);

  /* ================= VENTAS ================= */

  const agregarVenta = useCallback(
    async (venta: Omit<VentaDia, "id" | "fechaRegistro">) => {
      dispatch({ type: "AGREGAR_VENTA", payload: venta });

      if (isAuthenticated && spreadsheetId) {
        const nuevaVenta: VentaDia = {
          ...venta,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          fechaRegistro: new Date().toISOString(),
        };
        await googleSheetsService.guardarVenta(nuevaVenta);
      }
    },
    [isAuthenticated, spreadsheetId],
  );

  const actualizarVenta = useCallback(async (venta: VentaDia) => {
    dispatch({ type: "ACTUALIZAR_VENTA", payload: venta });
  }, []);

  const eliminarVenta = useCallback(async (id: string) => {
    dispatch({ type: "ELIMINAR_VENTA", payload: id });
  }, []);

  const setMes = useCallback((mes: Mes) => {
    dispatch({ type: "SET_MES", payload: mes });
  }, []);

  const setSemana = useCallback((semana: number) => {
    dispatch({ type: "SET_SEMANA", payload: semana });
  }, []);

  const setDia = useCallback((dia: DiaSemana) => {
    dispatch({ type: "SET_DIA", payload: dia });
  }, []);

  const actualizarPrecio = useCallback(
    (producto: TipoProducto, paquete: TipoPaquete, precio: number) => {
      dispatch({
        type: "ACTUALIZAR_PRECIO",
        payload: { producto, paquete, precio },
      });
    },
    [],
  );

  /* ================= CONSULTAS ================= */

  const obtenerVentasPorDia = useCallback(
    (mes: Mes, semana: number, dia: DiaSemana) =>
      state.ventas.filter(
        (v) => v.mes === mes && v.semana === semana && v.dia === dia,
      ),
    [state.ventas],
  );

  const obtenerVentasPorSemana = useCallback(
    (mes: Mes, semana: number) =>
      state.ventas.filter((v) => v.mes === mes && v.semana === semana),
    [state.ventas],
  );

  const obtenerVentasPorMes = useCallback(
    (mes: Mes) => state.ventas.filter((v) => v.mes === mes),
    [state.ventas],
  );

  const obtenerTotalPorDia = useCallback(
    (mes: Mes, semana: number, dia: DiaSemana) =>
      state.ventas
        .filter((v) => v.mes === mes && v.semana === semana && v.dia === dia)
        .reduce((sum, v) => sum + v.total, 0),
    [state.ventas],
  );

  const obtenerTotalPorSemana = useCallback(
    (mes: Mes, semana: number) =>
      state.ventas
        .filter((v) => v.mes === mes && v.semana === semana)
        .reduce((sum, v) => sum + v.total, 0),
    [state.ventas],
  );

  const obtenerTotalPorMes = useCallback(
    (mes: Mes) =>
      state.ventas
        .filter((v) => v.mes === mes)
        .reduce((sum, v) => sum + v.total, 0),
    [state.ventas],
  );

  const obtenerTotalesAnuales = useCallback(() => {
    const chorizo = state.ventas
      .filter((v) => v.producto === "chorizo")
      .reduce((sum, v) => sum + v.total, 0);

    const carne_molida = state.ventas
      .filter((v) => v.producto === "carne_molida")
      .reduce((sum, v) => sum + v.total, 0);

    return {
      chorizo,
      carne_molida,
      total: chorizo + carne_molida,
    };
  }, [state.ventas]);

  const value = useMemo(
    () => ({
      state,
      isInitialized,
      isAuthenticated,
      spreadsheetId,
      agregarVenta,
      actualizarVenta,
      eliminarVenta,
      setMes,
      setSemana,
      setDia,
      actualizarPrecio,
      initialize,
      signIn,
      signOut,
      createSpreadsheet,
      connectToSpreadsheet,
      obtenerVentasPorDia,
      obtenerVentasPorSemana,
      obtenerVentasPorMes,
      obtenerTotalPorDia,
      obtenerTotalPorSemana,
      obtenerTotalPorMes,
      obtenerTotalesAnuales,
    }),
    [
      state,
      isInitialized,
      isAuthenticated,
      spreadsheetId,
      agregarVenta,
      actualizarVenta,
      eliminarVenta,
      setMes,
      setSemana,
      setDia,
      actualizarPrecio,
      initialize,
      signIn,
      signOut,
      createSpreadsheet,
      connectToSpreadsheet,
      obtenerVentasPorDia,
      obtenerVentasPorSemana,
      obtenerVentasPorMes,
      obtenerTotalPorDia,
      obtenerTotalPorSemana,
      obtenerTotalPorMes,
      obtenerTotalesAnuales,
    ],
  );

  return (
    <GoogleSheetsContext.Provider value={value}>
      {children}
    </GoogleSheetsContext.Provider>
  );
}

export function useGoogleSheets() {
  const context = useContext(GoogleSheetsContext);
  if (!context) {
    throw new Error(
      "useGoogleSheets debe usarse dentro de GoogleSheetsProvider",
    );
  }
  return context;
}
