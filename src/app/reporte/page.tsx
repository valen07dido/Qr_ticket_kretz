// src/app/reportar/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, FC, ReactNode } from "react";

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
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// --- (Tipos y componentes de resultado sin cambios) ---
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

const LoadingScreen: FC<{ text: string }> = ({ text }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      p: 4,
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" sx={{ mt: 3, color: "text.secondary" }}>
      {text}
    </Typography>
  </Box>
);

// --- COMPONENTE ResultScreen ACTUALIZADO PARA ACEPTAR children ---
const ResultScreen: FC<{
  status: "success" | "error";
  message: string;
  ticketId?: string;
  children?: ReactNode; // <-- AÑADIDO
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
      <Alert severity="info" sx={{ mt: 2 }}>
        Referencia del Ticket: <strong>{ticketId}</strong>
      </Alert>
    )}
    {children} {/* <-- RENDERIZAMOS EL CONTENIDO ADICIONAL AQUÍ */}
    <Button
      variant="contained"
      onClick={() => window.location.reload()}
      sx={{ mt: 3 }}
    >
      Crear otra solicitud
    </Button>
  </Box>
);

// --- COMPONENTE PRINCIPAL DEL FORMULARIO ---
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
  // --- ELIMINADO: const [file, setFile] = useState<File | null>(null); ---

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partnersRes, equipmentsRes] = await Promise.all([
          fetch("/api/get-employees"),
          fetch("/api/get-equipments"),
        ]);
        if (!partnersRes.ok || !equipmentsRes.ok)
          throw new Error("No se pudo cargar los datos iniciales.");

        const partnersData: Partner[] = await partnersRes.json();
        const equipmentsData: Equipment[] = await equipmentsRes.json();

        setPartners(partnersData);
        setEquipments(equipmentsData);

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

    // --- ELIMINADO: Lógica para añadir 'attachment' a formData ---

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
        // <-- Usamos un bloque para definir constantes locales
        // --- LÓGICA DE WHATSAPP ---
        // ¡IMPORTANTE! Reemplaza este número con el de destino
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
            {/* --- NUEVA SECCIÓN PARA WHATSAPP --- */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                border: "1px dashed grey",
                borderRadius: 2,
                bgcolor: "action.hover",
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
              getOptionKey={(option) => option.id}
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
              <InputLabel id="ticket-type-label">Tipo de Solicitud</InputLabel>
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

            {/* --- ELIMINADO: Botón de adjuntar imagen --- */}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!selectedPartner || !title || !description}
            >
              Enviar Solicitud
            </Button>
          </Box>
        );
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ my: 4 }}>
      <Card sx={{ width: "100%", borderRadius: 4, boxShadow: 5 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
              Mesa de Ayuda
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
    <Suspense fallback={<LoadingScreen text="Inicializando..." />}>
      <ReportForm />
    </Suspense>
  );
}
