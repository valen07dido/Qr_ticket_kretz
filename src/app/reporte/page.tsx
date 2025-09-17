"use client";

import { useSearchParams } from "next/navigation";
import {
  useState,
  useEffect,
  Suspense,
  FC,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";

// --- IMPORTACIONES DE MUI ---
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Autocomplete,
  CssBaseline,
  IconButton,
  PaletteMode,
} from "@mui/material";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import Image from "next/image";
// --- IMPORTACIONES DE ICONOS ---
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Link from "next/link"; // <-- NUEVA IMPORTACIÓN para la navegación
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// --- (Tipos y constantes sin cambios) ---
type Status = "loading" | "form" | "submitting" | "success" | "error";
type TicketType = "falla" | "mejora" | "consulta";
interface Partner {
  id: number;
  name: string;
}
interface Equipment {
  id: number;
  name: string;
}
interface SuccessData {
  ticketId: string;
}
const ticketTypes = [
  { value: "falla", label: "Reportar una Falla / Incidente" },
  { value: "mejora", label: "Sugerir una Mejora" },
  { value: "consulta", label: "Realizar una Consulta" },
];

// =================================================================
// LÓGICA DE TEMA (MODIFICADA PARA SER SEGURA CON SSR)
// =================================================================
const ColorModeContext = createContext({ toggleColorMode: () => {} });

const AppThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // <-- MODIFICACIÓN: Iniciamos con 'light' y lo cambiaremos en el cliente si es necesario
  const [mode, setMode] = useState<PaletteMode>("light");

  // <-- MODIFICACIÓN: Este efecto se ejecuta SOLO en el cliente después del montaje.
  // Esto permite persistir la preferencia del usuario sin causar errores de hidratación.
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("theme-mode") as PaletteMode;
      if (savedMode) {
        setMode(savedMode);
      }
    } catch (error) {
      console.log("No se pudo acceder a localStorage.");
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          // <-- MODIFICACIÓN: Guardamos la preferencia en localStorage.
          localStorage.setItem("theme-mode", newMode);
          return newMode;
        });
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: { main: "#0052CC" },
                background: { default: "#f4f6f8", paper: "#ffffff" },
              }
            : {
                primary: { main: "#69A1FF" },
                background: { default: "#161C24", paper: "#212B36" },
              }),
        },
        typography: {
          fontFamily:
            'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

// =================================================================
// Componente para el botón de cambio de tema (Sin cambios)
// =================================================================
const ThemeToggleButton = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  return (
    <IconButton
      sx={{ ml: 1 }}
      onClick={colorMode.toggleColorMode}
      color="inherit"
      title="Cambiar tema"
    >
      {theme.palette.mode === "dark" ? (
        <Brightness7Icon />
      ) : (
        <Brightness4Icon />
      )}
    </IconButton>
  );
};

// =================================================================
// Componente de encabezado (MODIFICADO PARA RENDERIZAR EL BOTÓN SOLO EN CLIENTE)
// =================================================================
const Header: FC = () => {
  // <-- MODIFICACIÓN: Este estado nos dirá si ya estamos en el navegador.
  const [isClient, setIsClient] = useState(false);

  // <-- MODIFICACIÓN: Este efecto cambia el estado a 'true' solo después del montaje.
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        // 1. CAMBIO PRINCIPAL: Usamos 'baseline' para una mejor alineación de texto/logo
        alignItems: "baseline",
        justifyContent: "center",
        gap: { xs: 1, sm: 1.5 }, // Reducimos un poco el gap para que se vea más cohesivo
        mb: 3,
        position: "relative",
        width: "100%",
        height: "40px",
      }}
    >
      <Box sx={{ position: "absolute", top: 0, left: 0 }}>
        <Link href="/" passHref>
          <IconButton title="Volver al inicio">
            <ArrowBackIcon />
          </IconButton>
        </Link>
      </Box>
      <Image
        src="/Logo_Kretz.png"
        alt="Logo Kretz"
        width={100} // Ajustamos ligeramente los tamaños para el balance visual
        height={22}
        style={{ objectFit: "contain" }}
        priority
      />
      <Typography
        variant="h5"
        sx={{
          color: "text.secondary",
          fontWeight: 300,
          position: "relative",
          top: "-2px",
        }}
      >
        +
      </Typography>
      {/* 3. AJUSTE FINO: Envolvemos la imagen de Odoo en un Box para un control preciso */}
      <Box sx={{ position: "relative", top: "-1px" }}>
        <Image
          src="/Odoo_Official_Logo.png"
          alt="Logo Odoo"
          width={70} // Ajustamos ligeramente los tamaños para el balance visual
          height={22}
          style={{ objectFit: "contain" }}
          priority
        />
      </Box>

      <Box sx={{ position: "absolute", top: 0, right: 0 }}>
        {isClient ? (
          <ThemeToggleButton />
        ) : (
          <Box sx={{ width: 40, height: 40 }} />
        )}
      </Box>
    </Box>
  );
};

// --- (El resto de los componentes: LoadingScreen, ResultScreen, ReportForm, ReportarPage, no necesitan cambios) ---

const LoadingScreen: FC<{ text: string }> = ({ text }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "300px",
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" sx={{ mt: 3, color: "text.secondary" }}>
      {text}
    </Typography>
  </Box>
);

const ResultScreen: FC<{
  status: "success" | "error";
  message: string;
  ticketId?: string;
  children?: ReactNode;
}> = ({ status, message, ticketId, children }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      p: 4,
    }}
  >
    {status === "success" ? (
      <CheckCircleOutlineIcon sx={{ fontSize: 70, color: "success.main" }} />
    ) : (
      <ErrorOutlineIcon sx={{ fontSize: 70, color: "error.main" }} />
    )}
    <Typography variant="h5" component="h2" sx={{ mt: 2, fontWeight: "bold" }}>
      {status === "success" ? "¡Éxito!" : "Ocurrió un Error"}
    </Typography>
    <Typography sx={{ mt: 1, color: "text.secondary" }}>{message}</Typography>
    {ticketId && (
      <Alert severity="info" sx={{ mt: 2, textAlign: "left" }}>
        {" "}
        Referencia del Ticket: <strong>{ticketId}</strong>{" "}
      </Alert>
    )}
    {children}
    <Button
      variant="contained"
      onClick={() => window.location.reload()}
      sx={{ mt: 3 }}
    >
      {" "}
      Crear otra solicitud{" "}
    </Button>
  </Box>
);

function ReportForm() {
  const searchParams = useSearchParams();
  const equipoIdParam = searchParams.get("equipo_id");

  const [status, setStatus] = useState<Status>("loading");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [selectedTicketType, setSelectedTicketType] =
    useState<TicketType>("falla");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("0");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((res) => setTimeout(res, 500));
        const [partnersRes, equipmentsRes] = await Promise.all([
          fetch("/api/get-employees"),
          fetch("/api/get-equipments"),
        ]);
        if (!partnersRes.ok || !equipmentsRes.ok)
          throw new Error("No se pudo cargar los datos iniciales.");
        const partnersData: Partner[] = await partnersRes.json();
        const equipmentsData: Equipment[] = await equipmentsRes.json();
        const uniqueEquipments = [
          ...new Map(equipmentsData.map((item) => [item.name, item])).values(),
        ];
        setPartners(partnersData);
        setEquipments(uniqueEquipments);
        if (equipoIdParam) {
          const initialEquipment = equipmentsData.find(
            (e) => e.id === parseInt(equipoIdParam)
          );
          if (initialEquipment) {
            setSelectedEquipment(initialEquipment);
          }
        }
        setStatus("form");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Error desconocido."
        );
        setStatus("error");
      }
    };
    fetchData();
  }, [equipoIdParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("tipo_ticket", selectedTicketType);
    formData.append("partner_id", selectedPartner);
    if (selectedEquipment) {
      formData.append("equipo_id", selectedEquipment.id.toString());
    }
    try {
      const response = await fetch("/api/crear-ticket", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Error al crear el ticket.");
      setSuccessData({ ticketId: data.ticket_id });
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo conectar con el servidor."
      );
      setStatus("error");
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return <LoadingScreen text="Cargando datos..." />;
      case "submitting":
        return <LoadingScreen text="Creando tu ticket..." />;
      case "success": {
        const WHATSAPP_NUMBER = "5493415940839";
        const messageText = `Hola Infraestructura, adjunto una imagen para el ticket *${successData?.ticketId}*.\n\n*Asunto:* ${title}`;
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          messageText
        )}`;
        return (
          <ResultScreen
            status="success"
            message="Tu solicitud ha sido registrada."
            ticketId={successData?.ticketId}
          >
            <Box
              sx={{
                mt: 3,
                p: 2,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "action.hover",
                width: "100%",
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                Si necesitas enviar una imagen o captura de pantalla, puedes
                hacerlo directamente a nuestro WhatsApp.
              </Typography>
              <Button
                variant="contained"
                color="success"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Enviar Imagen por WhatsApp
              </Button>
            </Box>
          </ResultScreen>
        );
      }
      case "error":
        return <ResultScreen status="error" message={errorMessage} />;
      case "form":
        return (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <FormControl fullWidth required>
              <InputLabel id="partner-label">¿Quién reporta?</InputLabel>
              <Select
                labelId="partner-label"
                value={selectedPartner}
                label="¿Quién reporta?"
                onChange={(e) => setSelectedPartner(e.target.value)}
              >
                {partners.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              options={equipments}
              getOptionLabel={(option) => option.name}
              value={selectedEquipment}
              onChange={(event, newValue) => {
                setSelectedEquipment(newValue);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="Equipo Afectado (Opcional)" />
              )}
            />
            <TextField
              label="Título / Asunto"
              required
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: El monitor no enciende"
            />
            <TextField
              label="Descripción Detallada"
              required
              multiline
              rows={4}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el problema con el mayor detalle posible..."
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Prioridad</InputLabel>
                <Select
                  labelId="priority-label"
                  value={priority}
                  label="Prioridad"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value={"0"}>Baja</MenuItem>
                  <MenuItem value={"1"}>Media ⭐</MenuItem>
                  <MenuItem value={"2"}>Alta ⭐⭐</MenuItem>
                  <MenuItem value={"3"}>Urgente ⭐⭐⭐</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="ticket-type-label">
                  Tipo de Solicitud
                </InputLabel>
                <Select
                  labelId="ticket-type-label"
                  value={selectedTicketType}
                  label="Tipo de Solicitud"
                  onChange={(e) =>
                    setSelectedTicketType(e.target.value as TicketType)
                  }
                >
                  {ticketTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!selectedPartner || !title || !description}
              sx={{ py: 1.5 }}
            >
              Enviar Solicitud
            </Button>
          </Box>
        );
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{ my: 4, position: "relative" }}
    >
      <Header />
      <Card
        sx={{
          width: "100%",
          borderRadius: 4,
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 8px 32px 0 rgba(0,0,0,0.37)"
              : "0 8px 32px 0 rgba(31,38,135,0.17)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
              Crear tu Ticket
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
              Reporte General de Infraestructura
            </Typography>
          </Box>
          {renderContent()}
        </CardContent>
      </Card>
    </Container>
  );
}

export default function ReportarPage() {
  return (
    <AppThemeProvider>
      <Suspense fallback={<LoadingScreen text="Inicializando..." />}>
        <ReportForm />
      </Suspense>
    </AppThemeProvider>
  );
}
