import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
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

// Estado inicial
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

// Acciones
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
  | { type: "CARGAR_DATOS"; payload: AppState }
  | { type: "LIMPIAR_DATOS" };

// Reducer
function ventasReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "AGREGAR_VENTA": {
      const nuevaVenta: VentaDia = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fechaRegistro: new Date().toISOString(),
      };

      // Buscar si ya existe una venta para este día, producto y paquete
      const ventaExistenteIndex = state.ventas.findIndex(
        (v) =>
          v.mes === nuevaVenta.mes &&
          v.semana === nuevaVenta.semana &&
          v.dia === nuevaVenta.dia &&
          v.producto === nuevaVenta.producto &&
          v.paquete === nuevaVenta.paquete,
      );

      if (ventaExistenteIndex >= 0) {
        // Actualizar venta existente sumando las unidades
        const ventasActualizadas = [...state.ventas];
        const ventaExistente = ventasActualizadas[ventaExistenteIndex];
        const nuevasUnidades = ventaExistente.unidades + nuevaVenta.unidades;
        ventasActualizadas[ventaExistenteIndex] = {
          ...ventaExistente,
          unidades: nuevasUnidades,
          total: nuevasUnidades * ventaExistente.precioUnitario,
        };
        return { ...state, ventas: ventasActualizadas };
      }

      return { ...state, ventas: [...state.ventas, nuevaVenta] };
    }

    case "ACTUALIZAR_VENTA": {
      return {
        ...state,
        ventas: state.ventas.map((v) =>
          v.id === action.payload.id ? action.payload : v,
        ),
      };
    }

    case "ELIMINAR_VENTA": {
      return {
        ...state,
        ventas: state.ventas.filter((v) => v.id !== action.payload),
      };
    }

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

    case "CARGAR_DATOS":
      return action.payload;

    case "LIMPIAR_DATOS":
      return initialState;

    default:
      return state;
  }
}

// Context
interface VentasContextType {
  state: AppState;
  agregarVenta: (venta: Omit<VentaDia, "id" | "fechaRegistro">) => void;
  actualizarVenta: (venta: VentaDia) => void;
  eliminarVenta: (id: string) => void;
  setMes: (mes: Mes) => void;
  setSemana: (semana: number) => void;
  setDia: (dia: DiaSemana) => void;
  actualizarPrecio: (
    producto: TipoProducto,
    paquete: TipoPaquete,
    precio: number,
  ) => void;
  cargarDatos: (datos: AppState) => void;
  limpiarDatos: () => void;
  // Funciones de consulta
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

const VentasContext = createContext<VentasContextType | undefined>(undefined);

// Provider
export function VentasProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(ventasReducer, initialState);

  // Cargar datos del localStorage al iniciar
  React.useEffect(() => {
    const datosGuardados = localStorage.getItem("ventasData");
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados);
        dispatch({ type: "CARGAR_DATOS", payload: datos });
      } catch (e) {
        console.error("Error al cargar datos:", e);
      }
    }
  }, []);

  // Guardar datos en localStorage cuando cambien
  React.useEffect(() => {
    localStorage.setItem("ventasData", JSON.stringify(state));
  }, [state]);

  const agregarVenta = useCallback(
    (venta: Omit<VentaDia, "id" | "fechaRegistro">) => {
      dispatch({ type: "AGREGAR_VENTA", payload: venta });
    },
    [],
  );

  const actualizarVenta = useCallback((venta: VentaDia) => {
    dispatch({ type: "ACTUALIZAR_VENTA", payload: venta });
  }, []);

  const eliminarVenta = useCallback((id: string) => {
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

  const cargarDatos = useCallback((datos: AppState) => {
    dispatch({ type: "CARGAR_DATOS", payload: datos });
  }, []);

  const limpiarDatos = useCallback(() => {
    dispatch({ type: "LIMPIAR_DATOS" });
  }, []);

  // Funciones de consulta memoizadas
  const obtenerVentasPorDia = useCallback(
    (mes: Mes, semana: number, dia: DiaSemana) => {
      return state.ventas.filter(
        (v) => v.mes === mes && v.semana === semana && v.dia === dia,
      );
    },
    [state.ventas],
  );

  const obtenerVentasPorSemana = useCallback(
    (mes: Mes, semana: number) => {
      return state.ventas.filter((v) => v.mes === mes && v.semana === semana);
    },
    [state.ventas],
  );

  const obtenerVentasPorMes = useCallback(
    (mes: Mes) => {
      return state.ventas.filter((v) => v.mes === mes);
    },
    [state.ventas],
  );

  const obtenerTotalPorDia = useCallback(
    (mes: Mes, semana: number, dia: DiaSemana) => {
      return state.ventas
        .filter((v) => v.mes === mes && v.semana === semana && v.dia === dia)
        .reduce((sum, v) => sum + v.total, 0);
    },
    [state.ventas],
  );

  const obtenerTotalPorSemana = useCallback(
    (mes: Mes, semana: number) => {
      return state.ventas
        .filter((v) => v.mes === mes && v.semana === semana)
        .reduce((sum, v) => sum + v.total, 0);
    },
    [state.ventas],
  );

  const obtenerTotalPorMes = useCallback(
    (mes: Mes) => {
      return state.ventas
        .filter((v) => v.mes === mes)
        .reduce((sum, v) => sum + v.total, 0);
    },
    [state.ventas],
  );

  const obtenerTotalesAnuales = useCallback(() => {
    const chorizo = state.ventas
      .filter((v) => v.producto === "chorizo")
      .reduce((sum, v) => sum + v.total, 0);
    const carne_molida = state.ventas
      .filter((v) => v.producto === "carne_molida")
      .reduce((sum, v) => sum + v.total, 0);
    return { chorizo, carne_molida, total: chorizo + carne_molida };
  }, [state.ventas]);

  const value = useMemo(
    () => ({
      state,
      agregarVenta,
      actualizarVenta,
      eliminarVenta,
      setMes,
      setSemana,
      setDia,
      actualizarPrecio,
      cargarDatos,
      limpiarDatos,
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
      agregarVenta,
      actualizarVenta,
      eliminarVenta,
      setMes,
      setSemana,
      setDia,
      actualizarPrecio,
      cargarDatos,
      limpiarDatos,
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
    <VentasContext.Provider value={value}>{children}</VentasContext.Provider>
  );
}

// Hook personalizado
export function useVentas() {
  const context = useContext(VentasContext);
  if (context === undefined) {
    throw new Error("useVentas debe usarse dentro de un VentasProvider");
  }
  return context;
}
