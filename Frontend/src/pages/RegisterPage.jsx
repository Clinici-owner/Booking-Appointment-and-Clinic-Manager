import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { UserService } from "../services/userService";
import { useNavigate } from "react-router-dom";

import logo from "../assets/images/Logo.jpg";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await UserService.register(email, password);
      navigate("/verify", { state: { email } });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  if (isLoggedIn) {
    window.location.href = "/"; // Redirect to home if already logged in
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#FFF] p-4">
      <div className="bg-white w-full max-w-5xl h-[600px] flex shadow-2xl overflow-hidden rounded-[40px]">
        <div className="flex-1">
          <img
            src={logo}
            alt="Logo"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-12 py-8">
          <h1 className="text-[32px] font-extrabold text-custom-blue mb-6">
            Đăng ký
          </h1>

          <form className="w-full max-w-md" onSubmit={handleSubmit}>

            {/* Email */}
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

            {/* Mật khẩu */}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value.length < 6) {
                    setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự.");
                  } else {
                    setErrorMsg("");
                  }
                }}
                className="w-full border border-[#51A9FF] rounded-xl py-3 px-5 pr-12 text-[#2a2e83] text-base outline-none"
              />
              <i
                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"
                  } absolute right-4 top-1/2 -translate-y-1/2 text-[#51A9FF] text-lg cursor-pointer`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            {/* Xác nhận mật khẩu */}
            <label
              className="block text-custom-blue text-sm font-medium mb-1"
              htmlFor="confirmPassword"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative mb-4">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (e.target.value !== password) {
                    setErrorMsg("Mật khẩu xác nhận không khớp.");
                  } else {
                    setErrorMsg("");
                  }
                }}
                className="w-full border border-[#51A9FF] rounded-xl py-3 px-5 pr-12 text-[#2a2e83] text-base outline-none"
              />

              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} absolute right-4 top-1/2 -translate-y-1/2 text-[#51A9FF] text-lg cursor-pointer`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
            {/* Đã có tài khoản */}
            <div className="mb-4 flex items-center justify-between text-sm text-[#2a2e83]">
              <div>
                Bạn đã có tài khoản?{" "}
                <a className="font-semibold text-[#51A9FF]" href="/login">
                  Đăng nhập
                </a>
              </div>
              <a className="underline" href="/forgot-password">
                Quên mật khẩu?
              </a>
            </div>

            {/* Error */}
            {errorMsg && (
              <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              disabled={password.length < 6 || confirmPassword !== password || !email}
              sx={{
                mt: 1,
                py: 1.5,
                px: 6,
                borderRadius: "9999px",
                backgroundColor: "#51A9FF",
                fontSize: "1rem",
                textTransform: "none",
                width: "100%",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#006dff" },
              }}
            >
              Đăng ký
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;