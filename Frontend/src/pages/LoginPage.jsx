import React, { useState } from "react";
import { Button, Alert } from "@mui/material";
import { UserService } from "../services/userService";
import { useLocation } from "react-router-dom";

import logo from "../assets/images/Logo.jpg"
import { useEffect } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const successMessage = location.state?.successMessage;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await UserService.login(email, password);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

   const handleGoogleLogin = () => {
        window.location.href = 'https://booking-appointment-be.up.railway.app/auth/google';
  };

  useEffect(() => {
    const getSessionUser = async () => {
      try {
        const user = sessionStorage.getItem("user");
        if (user) {
          const parsedUser = JSON.parse(user);
          if (parsedUser && parsedUser._id) {
            window.location.href = "/";
          }
        }
      } catch (error) {
        console.error("Error retrieving session user:", error);
      }
    };
    getSessionUser();
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#FFF] p-4">
      <div className="bg-white w-full max-w-5xl h-[600px] flex shadow-2xl overflow-hidden overflow-hidden rounded-[40px]">
        {successMessage && (
          <Alert severity="success" className="absolute top-4 left-1/2 transform -translate-x-1/2">
            {successMessage}
          </Alert>
        )}
        <div className="flex-1 flex flex-col items-center justify-center px-12 py-8">
          <h1 className="text-[32px] font-extrabold text-custom-blue mb-6">
            Đăng nhập
          </h1>

          <div className="flex space-x-6 mb-6">
            <button onClick={handleGoogleLogin} className="bg-[#51A9FF] hover:bg-custom-bluehover2 hover:cursor-pointer w-12 h-12 rounded-full flex items-center justify-center text-white text-xl">
              <i className="fab fa-google"></i>
            </button>
            <button className="bg-[#51A9FF] hover:bg-custom-bluehover2 hover:cursor-pointer w-12 h-12 rounded-full flex items-center justify-center text-white text-xl">
              <i className="fab fa-facebook-f"></i>
            </button>
            <button className="bg-[#51A9FF] hover:bg-custom-bluehover2 hover:cursor-pointer w-12 h-12 rounded-full flex items-center justify-center text-white text-xl">
              <i className="fab fa-instagram"></i>
            </button>
          </div>

          <div className="text-[#2a2e83] mb-6 text-sm">OR</div>

          <form className="w-full max-w-md" onSubmit={handleSubmit}>
            <label
              className="block text-custom-blue text-sm font-medium mb-1"
              htmlFor="email"
            >
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#51A9FF] rounded-xl py-3 px-5 mb-4 text-[#2a2e83] text-base outline-none"
            />

            <label
              className="block text-custom-blue text-sm font-medium mb-1"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <div className="relative mb-4">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#51A9FF] rounded-xl py-3 px-5 pr-12 text-[#2a2e83] text-base outline-none"
              />
              <i
                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"
                  } absolute right-4 top-1/2 -translate-y-1/2 text-[#51A9FF] text-lg cursor-pointer`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            <div className="mb-4 flex items-center justify-between text-sm text-custom-blue">
              <div>
                Bạn đã có tài khoản chưa?{" "}
                <a className="font-semibold text-[#51A9FF]" href="/register">
                  Đăng kí ngay
                </a>
              </div>
              <a className="underline" href="/forgot-password">
                Quên mật khẩu?
              </a>
            </div>

            {errorMsg && <p className="text-red-500 text-sm mb-3">{errorMsg}</p>}

            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 1,
                py: 1.5,
                px: 6,
                borderRadius: "9999px",
                backgroundColor: "#51A9FF",
                fontSize: "1rem",
                textTransform: "none",
                width: "100%",
                "&:hover": { backgroundColor: "#006dff" },
              }}
            >
              Đăng nhập
            </Button>
          </form>
        </div>

        <div className="flex-1">
          <img
            src={logo}
            alt="Logo"
            className="w-full h-full object-cover object-center"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;