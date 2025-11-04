import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Box,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar({ setActiveTab }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  // 🔹 Configuración dinámica del menú según el rol
  const menuItems = [
    ...(user?.rol === "admin"
      ? [
          { text: "Dashboard", icon: <DashboardIcon />, tab: "dashboard" },
          { text: "Reportes", icon: <AssessmentIcon />, tab: "reportes" },
        ]
      : []),
    {
      text: user?.rol === "admin" ? "Inventario" : "Reservar Material",
      icon: <InventoryIcon />,
      tab: "inventario",
    },
    {
      text: user?.rol === "admin" ? "Préstamos" : "Mis Préstamos",
      icon: <AssignmentIcon />,
      tab: "prestamos",
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #1565c0 0%, #0d47a1 100%)",
          color: "#fff",
          borderRight: "none",
          boxShadow: "3px 0 10px rgba(0,0,0,0.2)",
          paddingTop: 2,
        },
      }}
    >
      {/* 👤 Encabezado del usuario */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 2,
          mt: 1,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#fff",
            color: "#1565c0",
            width: 60,
            height: 60,
            fontWeight: "bold",
            textTransform: "uppercase",
            mb: 1,
            border: "2px solid rgba(255,255,255,0.5)",
          }}
        >
          {user?.nombre?.charAt(0) || "?"}
        </Avatar>

        <Typography
          variant="subtitle1"
          fontWeight="bold"
          align="center"
          sx={{ px: 1, lineHeight: 1.2 }}
        >
          {user?.nombre || "Usuario no identificado"}
        </Typography>

        <Typography variant="caption" color="rgba(255,255,255,0.8)">
          {user?.rol ? user.rol.toUpperCase() : "SIN ROL"}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 1 }} />

      {/* 📋 Menú principal */}
      <List>
        {menuItems.map((item) => (
          <Tooltip key={item.text} title={item.text} placement="right">
            <ListItem
              button
              onClick={() => setActiveTab(item.tab)}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
                transition: "0.3s",
              }}
            >
              <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </Tooltip>
        ))}

        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }} />

        {/* 🔒 Cerrar sesión */}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary={`Cerrar sesión${user?.nombre ? ` (${user.nombre})` : ""}`}
            sx={{ color: "#fff" }}
          />
        </ListItem>
      </List>
    </Drawer>
  );
}
