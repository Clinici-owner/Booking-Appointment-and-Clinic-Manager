import React, { useState } from "react";
import { Button } from "@mui/material"; 
import { UserService } from "../services/userService";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await UserService.login(email, password);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#FFF] p-4">
      <div className="bg-white w-full max-w-5xl h-[600px] flex shadow-2xl overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center px-12 py-8">
          <h1 className="text-[32px] font-extrabold text-[#2a2e83] mb-6">
            Đăng nhập
          </h1>

          <div className="flex space-x-6 mb-6">
            <button className="bg-[#c56a38] w-12 h-12 rounded-full flex items-center justify-center text-white text-xl">
              <i className="fab fa-google"></i>
            </button>
            <button className="bg-[#c56a38] w-12 h-12 rounded-full flex items-center justify-center text-white text-xl">
              <i className="fab fa-facebook-f"></i>
            </button>
            <button className="bg-[#c56a38] w-12 h-12 rounded-full flex items-center justify-center text-white text-xl">
              <i className="fab fa-instagram"></i>
            </button>
          </div>

          <div className="text-[#2a2e83] mb-6 text-sm">OR</div>

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
              className="w-full border border-[#c56a38] rounded-xl py-3 px-5 mb-4 text-[#2a2e83] text-base outline-none"
            />

            <label
              className="block text-[#2a2e83] text-sm font-medium mb-1"
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
                className="w-full border border-[#c56a38] rounded-xl py-3 px-5 pr-12 text-[#2a2e83] text-base outline-none"
              />
              <i
                className={`fas ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } absolute right-4 top-1/2 -translate-y-1/2 text-[#c56a38] text-lg cursor-pointer`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            <div className="mb-4 flex items-center justify-between text-sm text-[#2a2e83]">
              <div>
                Bạn đã có tài khoản chưa?{" "}
                <a className="font-semibold text-[#c56a38]" href="/register">
                  Đăng kí ngay
                </a>
              </div>
              <a className="underline" href="#">
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
                backgroundColor: "#c56a38",
                fontSize: "1rem",
                textTransform: "none",
                width: "100%",
                "&:hover": { backgroundColor: "#a8542d" },
              }}
            >
              Đăng nhập
            </Button>
          </form>
        </div>

        <div className="flex-1">
          <img
            src="https://storage.googleapis.com/a1aa/image/f14b8c57-4009-40cf-05bc-6871b0b813c5.jpg"
            alt="Pet image"
            className="w-full h-full object-cover object-center rounded-tl-[40px] rounded-bl-[40px]"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
