import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { UserService } from "../services/userService";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import image from "../assets/images/phongkham.png"; 

const OTPVerifyPage = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));

  const [otpMessage, setOtpMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (email) {
      setOtpMessage(`Đã gửi mã OTP vào email thành công`);
      setTimeout(() => {
        setOtpMessage("");
      }, 2000);
    } else {
      console.warn("Không có email được truyền");
    }
  }, [email]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Tự động focus sang ô tiếp theo
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setErrorMsg("Vui lòng nhập đầy đủ mã OTP");
      return;
    }
    if (email) {
      UserService.verify(email, otpString)
        .then((res) => {
          setOtpMessage(res.message);
          setErrorMsg("");
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        })
        .catch((err) => {
          setErrorMsg(err.message);
        });
    }
  };

  return (
    <>
      <div className="animate-slide-down font-weight-bold absolute top-0 left-0 right-0 flex items-center justify-center">
        {otpMessage && <Alert severity="success">{otpMessage}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {/* Phần còn lại của UI */}
      </div>

      <div className=" w-screen h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white w-full max-w-5xl h-[500px] flex shadow-2xl rounded-3xl overflow-hidden">
          {/* Left Section */}
          <div className="flex-1 flex flex-col items-center justify-center px-12 py-8">
            <h1 className="text-[28px] font-extrabold text-[#2a2e83] mb-6">
              Xác nhận OTP
            </h1>

            <div className="mb-4 flex flex-col items-center">
              <i className="fas fa-mobile-alt text-3xl text-[##2a2e83] mb-2"></i>
              <span className="text-sm text-[#2a2e83]">Nhập mã</span>
            </div>

            <form onSubmit={handleSubmit} className="mb-6 flex space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  className="w-12 h-12 text-center text-xl border-2 border-[#2a2e83] rounded-lg focus:outline-none"
                />
              ))}
            </form>

            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-[#2a2e83] text-white px-6 py-2 rounded-full hover:bg-[#1f2230] transition-all"
            >
              Xác nhận
            </button>

            <a href="/register" className="text-[#2a2e83] mt-4">
              <ArrowBackIcon className="mr-1" />
              Quay lại
            </a>
          </div>

          {/* Right Section */}
          <div className="flex-1 hidden md:block">
            <img
              src={image}
              alt="OTP"
              className="w-full h-full object-cover object-center rounded-tr-3xl rounded-br-3xl"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default OTPVerifyPage;
