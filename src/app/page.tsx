// src/app/page.tsx
"use client";

import {
  useState,
  useEffect,
  FC,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  PaletteMode,
  // Ya no necesitamos Grid
  Paper,
  CssBaseline,
} from "@mui/material";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// Iconos
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

// --- (Componentes de Tema y Header se mantienen igual) ---

const ColorModeContext = createContext({ toggleColorMode: () => {} });

const AppThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>("light");
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("theme-mode") as PaletteMode;
      if (savedMode) setMode(savedMode);
    } catch (e) {}
  }, []);
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const newMode = prev === "light" ? "dark" : "light";
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

const ThemeToggleButton = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  return (
    <IconButton
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

const Header: FC = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
        gap: 1.5,
        mb: 3,
        mt: 2,
        pt: 2,
        position: "relative",
        width: "100%",
        height: "40px",
      }}
    >
      <Image
        src="/Logo_Kretz.png"
        alt="Logo Kretz"
        width={100}
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
      <Box sx={{ position: "relative", top: "-1px" }}>
        <Image
          src="/Odoo_Official_Logo.png"
          alt="Logo Odoo"
          width={70}
          height={22}
          style={{ objectFit: "contain" }}
          priority
        />
      </Box>
      <Box sx={{ position: "absolute", top: 8, right: 0 }}>
        {isClient ? (
          <ThemeToggleButton />
        ) : (
          <Box sx={{ width: 40, height: 40 }} />
        )}
      </Box>
    </Box>
  );
};

const WelcomeScreen: FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };
  const features = [
    {
      icon: <ReportProblemOutlinedIcon fontSize="large" color="primary" />,
      text: "Reporta fallas e incidentes de forma rápida y sencilla.",
    },
    {
      icon: <LightbulbOutlinedIcon fontSize="large" color="primary" />,
      text: "Sugiere mejoras para nuestros sistemas o instalaciones.",
    },
    {
      icon: <HelpOutlineOutlinedIcon fontSize="large" color="primary" />,
      text: "Realiza consultas técnicas de equipos.",
    },
  ];
  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ textAlign: "center", py: 4 }}
    >
      <motion.div variants={itemVariants}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: "bold",
            mb: 2,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          Bienvenido al portal de Infraestructura
        </Typography>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Typography
          variant="h6"
          sx={{ color: "text.secondary", mb: 4, maxWidth: "600px", mx: "auto" }}
        >
          La plataforma central para gestionar todas las solicitudes de
          Infraestructura.
        </Typography>
      </motion.div>

      {/* ===================== INICIO DEL CAMBIO ===================== */}
      {/* Reemplazamos Grid container con un Box con Flexbox */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          // En pantallas pequeñas (xs) la dirección es columna (apilado vertical)
          // En pantallas grandes (sm y más) la dirección es fila (uno al lado del otro)
          flexDirection: { xs: "column", sm: "row" },
          // El espacio entre elementos. theme.spacing(4) es 32px por defecto.
          gap: 4,
          mb: 5,
        }}
      >
        {features.map((feature, index) => (
          // Cada item es ahora un Box animado que controla su propio ancho
          <Box
            key={index}
            component={motion.div}
            variants={itemVariants}
            sx={{
              // En pantallas grandes, cada item ocupa 1/3 del espacio disponible
              width: { xs: "100%", sm: "33.33%" },
            }}
          >
            <Paper elevation={0} sx={{ p: 2, bgcolor: "transparent" }}>
              <Box sx={{ mb: 1 }}>{feature.icon}</Box>
              <Typography variant="body1">{feature.text}</Typography>
            </Paper>
          </Box>
        ))}
      </Box>
      {/* ====================== FIN DEL CAMBIO ======================= */}

      <motion.div variants={itemVariants}>
        <Link href="/reporte" passHref>
          <Box
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{ py: 1.5, px: 5, borderRadius: "50px" }}
            >
              Crear una Solicitud
            </Button>
          </Box>
        </Link>
      </motion.div>
    </Box>
  );
};

// =================================================================
// Componente interno que consume el tema (versión "ventana")
// =================================================================
function WelcomePageContent() {
  const theme = useTheme();

  const welcomeBackground = {
    background:
      theme.palette.mode === "light"
        ? "linear-gradient(135deg, #e6f7ff 0%, #f9f0ff 100%)"
        : "linear-gradient(135deg, #1A233A 0%, #3A2D48 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientAnimation 15s ease infinite",
    "@keyframes gradientAnimation": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        ...welcomeBackground,
      }}
    >
      <Container component="main" maxWidth="md">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
          }}
        >
          <Header />
          <WelcomeScreen />
        </Paper>
      </Container>
    </Box>
  );
}

// =================================================================
// El componente principal que provee el tema
// =================================================================
export default function HomePage() {
  return (
    <AppThemeProvider>
      <WelcomePageContent />
    </AppThemeProvider>
  );
}
