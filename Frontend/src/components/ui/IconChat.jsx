import React from "react";
import { Fab } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const IconChat = ({ onClick, icon = <ArrowUpwardIcon />, sx = {}, ...props }) => {
  return (
    <Fab
      color="primary"
      onClick={onClick}
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1000,
        boxShadow: 3,
        ...sx
      }}
      {...props}
    >
      {icon}
    </Fab>
  );
};

export { IconChat };
