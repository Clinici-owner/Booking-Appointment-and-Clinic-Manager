import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import socket from "../lib/socket";
import { getNotificationsByUser } from "../services/notificationService";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hasNew, setHasNew] = useState(false);
  const [justReceived, setJustReceived] = useState(false);
  const [readNotiIds, setReadNotiIds] = useState([]); // 👉 để đánh dấu đã xem

  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    try {
      const notiList = await getNotificationsByUser(user._id);
      setNotifications(notiList);
    } catch (err) {
      console.error("Không thể load thông báo:", err.message);
    }
  }, [user?._id]);

  // Đăng ký socket khi mount
  useEffect(() => {
    if (user?.role === "patient") {
      socket.emit("register", user._id);
      console.log("Đã đăng ký socket:", user._id);

      fetchNotifications();

      socket.on("invited_to_room", (data) => {
        console.log("Nhận socket: invited_to_room", data);
        setHasNew(true);
        setJustReceived(true);
      });

      socket.on("complete_step", (data) => {
      console.log("📥 Nhận socket: complete_step", data);
      setHasNew(true);
      setJustReceived(true);

    });

      return () => {
        socket.off("invited_to_room");
        socket.off("complete_step");
      };
    }
  }, [fetchNotifications, user?.role, user?._id]);

  useEffect(() => {
    if (anchorEl && justReceived) {
      console.log("Popover mở và có socket gần đây → fetch lại");
      fetchNotifications();
      setJustReceived(false);
    }
  }, [anchorEl, justReceived, fetchNotifications]);

  const handleOpen = (event) => {
    console.log("Đã click mở chuông");
    setAnchorEl(event.currentTarget);
    setHasNew(false);

    if (!justReceived) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleHover = (id) => {
    if (!readNotiIds.includes(id)) {
      setReadNotiIds((prev) => [...prev, id]);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge color="error" variant="dot" invisible={!hasNew}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Typography sx={{ p: 2, fontWeight: "bold" }}>Thông báo</Typography>
        <Divider />
        <List dense sx={{ width: 320, maxHeight: 400, overflow: "auto" }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="Không có thông báo nào." />
            </ListItem>
          ) : (
            notifications.map((noti) => {
              const isUnread = !readNotiIds.includes(noti._id);
              return (
                <ListItem
                  key={noti._id}
                  alignItems="flex-start"
                  onMouseEnter={() => handleHover(noti._id)}
                  sx={{
                    backgroundColor: isUnread ? "#f5f5f5" : "inherit",
                    fontWeight: isUnread ? "bold" : "normal",
                    cursor: "pointer",
                    borderLeft: isUnread ? "4px solid red" : "4px solid transparent",
                    pl: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography fontWeight={isUnread ? "bold" : "normal"}>
                        {noti.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2">{noti.message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(noti.createdAt).toLocaleString("vi-VN")}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              );
            })
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationDropdown;
