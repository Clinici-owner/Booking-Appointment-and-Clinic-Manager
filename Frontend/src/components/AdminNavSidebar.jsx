import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { Link } from "react-router-dom";

import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EmergencyIcon from '@mui/icons-material/Emergency';
import EventIcon from "@mui/icons-material/Event";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PeopleIcon from "@mui/icons-material/People";
import PersonalInjuryIcon from '@mui/icons-material/PersonalInjury';
import SettingsIcon from "@mui/icons-material/Settings";
const drawerWidth = 240;

const navItems = [
  { label: "Thống kê", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { label: "Quản lý nhân viên", icon: <PeopleIcon />, path: "/admin/staffs" },
  { label: "Quản lý bệnh nhân", icon: <PersonalInjuryIcon />, path: "/admin/patients" },
  { label: "Quản lý chuyên khoa", icon: <EmergencyIcon />, path: "/admin/specialties" },
  { label: "Quản lý lịch làm việc", icon: <CalendarMonthIcon />, path: "/admin/schedules" },
  { label: "Quản lý lịch hẹn", icon: <EventIcon />, path: "/admin/appointments" },
  { label: "Dịch vụ y tế", icon: <MedicalServicesIcon />, path: "/createMedical" },
  { label: "Hồ sơ bệnh án", icon: <AssignmentIcon />, path: "/admin/records" },
  { label: "Tạo bài đăng", icon: <NewspaperIcon />, path: "/admin/news" },
  { label: "Tài chính & thanh toán", icon: <MonetizationOnIcon />, path: "/admin/billing" },
  { label: "Cài đặt hệ thống", icon: <SettingsIcon />, path: "/admin/settings" },
];

export default function AdminNavSidebar({ children }) {
  return (
    <Box sx={{ display: "flex"}}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          marginTop: "64px",

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
