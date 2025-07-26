import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { Link } from "react-router-dom";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EmergencyIcon from '@mui/icons-material/Emergency';
import EventIcon from "@mui/icons-material/Event";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PeopleIcon from "@mui/icons-material/People";
import PersonalInjuryIcon from '@mui/icons-material/PersonalInjury';

const drawerWidth = 240;

const navItems = [
  { label: "Thống kê", icon: <DashboardIcon />, path: "/admin/statistical" },
  { label: "Quản lý nhân viên", icon: <PeopleIcon />, path: "/admin/staffs" },
  { label: "Quản lý bệnh nhân", icon: <PersonalInjuryIcon />, path: "/admin/patients" },
  { label: "Quản lý chuyên khoa", icon: <EmergencyIcon />, path: "/admin/specialties" },
  { label: "Quản lý gói khám sức khỏe", icon: <MedicalServicesIcon />, path: "/admin/health-packages" },
  { label: "Quản lý lịch làm việc", icon: <CalendarMonthIcon />, path: "/admin/schedules/manage" },
  { label: "Quản lý lịch hẹn", icon: <EventIcon />, path: "/admin/appointment-admin" },
  { label: "Dịch vụ y tế", icon: <MedicalServicesIcon />, path: "/createMedical" },
  { label: "Tạo bài đăng", icon: <NewspaperIcon />, path: "/admin/news" },
  { label: "Tài chính & thanh toán", icon: <MonetizationOnIcon />, path: "/admin/billing" },
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
          marginTop: "66px",
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Box 
          sx={{
            height: 'calc(100vh - 140px)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}
        >
          <List>
            {navItems.map((item, index) => (
              <ListItemButton
                key={index}
                component={Link}
                to={item.path}
                sx={{
                  '&:hover': {
                    backgroundColor: '#e0e0e0',
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Content bên phải */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}