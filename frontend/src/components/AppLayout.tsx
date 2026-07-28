import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import ContactsIcon from "@mui/icons-material/PeopleAltOutlined";
import DealsIcon from "@mui/icons-material/HandshakeOutlined";
import TasksIcon from "@mui/icons-material/ChecklistOutlined";
import UsersIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 232;

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: <DashboardIcon />, end: true },
  { to: "/companies", label: "Companies", icon: <BusinessIcon /> },
  { to: "/contacts", label: "Contacts", icon: <ContactsIcon /> },
  { to: "/deals", label: "Deals", icon: <DealsIcon /> },
  { to: "/tasks", label: "Tasks", icon: <TasksIcon /> },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const initials = user
    ? `${user.first_name?.[0] ?? user.username[0]}${
        user.last_name?.[0] ?? ""
      }`.toUpperCase()
    : "";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            CRM
          </Typography>
        </Toolbar>
        <Divider />
        <List sx={{ px: 1, py: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.end}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                "&.active": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
          {user?.role === "admin" && (
            <ListItemButton
              component={NavLink}
              to="/users"
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                "&.active": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <UsersIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
          )}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Toolbar sx={{ justifyContent: "flex-end", gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {user?.username}
              {user?.role === "admin" ? " · Admin" : " · Manager"}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                {initials}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                }}
              >
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
