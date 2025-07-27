import React from "react";
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
} from "@mui/material";
import { Link } from "react-router-dom";

import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import AssignmentIcon from "@mui/icons-material/Assignment";

const drawerWidth = 240;

const user = JSON.parse(sessionStorage.getItem("user"));

const navItems = [
  { label: "Tạo quy trình khám bệnh", icon: <MedicalServicesIcon />, path: "/doctor/createMedicalProcess" },
  { label: "Danh sách quy trình khám bệnh", icon: <MedicalServicesIcon />, path: "/doctor/medicalProcess" },
  { label: "Xem lịch trình làm việc", icon: <AssignmentIcon />, path: "/schedules/own" },
  { label: "Danh sách bệnh nhân", icon: <AssignmentIcon />, path: "/doctor/patient-medical-histories" },
  { label: "Danh sách đặt lịch", icon: <AssignmentIcon />, path: "/doctor/appointment-list" },
  { label: "Hồ sơ bác sĩ", icon: <AssignmentIcon />, path: `/doctor/profile/${user?._id}` },
];

export default function DoctorNavSidebar({ children }) {
  return (
    <Box sx={{ display: "flex"}}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          marginTop: "64px", // Adjust for AppBar height

          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <List>
          {navItems.map((item, index) => (
            <ListItem
              button
              key={index}
              component={Link}
              to={item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Content bên phải */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
