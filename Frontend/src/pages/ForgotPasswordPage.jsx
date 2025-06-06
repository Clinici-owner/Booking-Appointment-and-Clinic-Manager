import React, { useState } from "react";
import { Button } from "@mui/material";
import { UserService } from "../services/userService";
import { useNavigate } from "react-router-dom";

import logo from "../assets/images/Logo.jpg"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await UserService.forgotPassword(email);
      navigate("/verify-forgot-password", { state: { email } });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#FFF] p-4">
      <div className="bg-white w-full max-w-5xl h-[600px] flex shadow-2xl overflow-hidden overflow-hidden rounded-[40px]">
        <div className="flex-1 flex flex-col items-center justify-center px-12 py-8">
          <h1 className="text-[32px] font-extrabold text-[#2a2e83] mb-6">
            Quên Mật Khẩu
          </h1>

          <form className="w-full max-w-md" onSubmit={handleSubmit}>
            <label
              className="block text-[#2a2e83] text-sm font-medium mb-1"
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
                "&:hover": { backgroundColor: "#2a2e83" },
              }}
            >
              Tiếp Tục
            </Button>
          </form>
        </div>

        <div className="flex-1">
          <img
            src={logo}
            alt="Logo   "
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

export default ForgotPasswordPage;
