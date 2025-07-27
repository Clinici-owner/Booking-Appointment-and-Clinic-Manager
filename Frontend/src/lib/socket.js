import { io } from "socket.io-client";


const socket = io("https://booking-appointment-be.up.railway.app", {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
