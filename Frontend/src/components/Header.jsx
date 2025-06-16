import React from "react";
import { Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { Link } from "react-router-dom";
import LogoMini from "../assets/images/LogoMini.png"; // Đảm bảo đường dẫn đúng đến logo

function Header() {
  const location = useLocation();
  const navigate = useNavigate(); // Hook để điều hướng

  const isActive = (path) => location.pathname === path;

  const handleProfileClick = () => {
    navigate("/user-profile"); // Điều hướng đến /user-profile khi nhấn
  };

  return (
    <div>
      <nav className=" px-18 bg-white shadow-lg rounded-b-xl px-4 py-3 flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={LogoMini}
            alt="Phòng khám Phúc Hưng logo with red and blue colors and medical cross"
            className="w-16 h-16 rounded-full"
          />
          <div className="leading-tight">
            <p className="text-custom-blue font-semibold text-lg">Phòng khám</p>
            <p className="text-custom-red font-bold text-[32px] -mt-1">
              Phúc Hưng
            </p>
          </div>
        </div>

        {/* Menu */}
        <ul className="hidden md:flex items-center space-x-12 font-semibold text-base">
          <li>
            <Link
              to="/home"
              className={`px-3 py-2 rounded-full font-semibold cursor-pointer transition duration-300 hover:shadow-md ${
                isActive("/home")
                  ? "text-white bg-custom-blue shadow-md"
                  : isActive("/")
                  ? "text-white bg-custom-blue shadow-md"
                  : "text-black hover:bg-custom-bluehover"
              }`}
            >
              Trang chủ
            </Link>
          </li>
          <li>
            <Link
              to="/aboutus"
              className={`px-3 py-2 rounded-full font-semibold cursor-pointer transition duration-300 hover:shadow-md ${
                isActive("/aboutus")
                  ? "text-white bg-custom-blue shadow-md"
                  : "text-black hover:bg-custom-bluehover"
              }`}
            >
              Về chúng tôi
            </Link>
          </li>
          <li>
            <Link
              to="/specialties"
              className={`px-3 py-2 rounded-full font-semibold cursor-pointer transition duration-300 hover:shadow-md ${
                isActive("/specialties")
                  ? "text-white bg-custom-blue shadow-md"
                  : "text-black hover:bg-custom-bluehover"
              }`}
            >
              Chuyên khoa
            </Link>
          </li>
          <li>
            <Link
              to="/services"
              className={`px-3 py-2 rounded-full font-semibold cursor-pointer transition duration-300 hover:shadow-md ${
                isActive("/services")
                  ? "text-white bg-custom-blue shadow-md"
                  : "text-black hover:bg-custom-bluehover"
              }`}
            >
              Dịch vụ
            </Link>
          </li>
          <li>
            <Link
              to="/news"
              className={`px-3 py-2 rounded-full font-semibold cursor-pointer transition duration-300 hover:shadow-md ${
                isActive("/news")
                  ? "text-white bg-custom-blue shadow-md"
                  : "text-black hover:bg-custom-bluehover"
              }`}
            >
              Tin tức
            </Link>
          </li>
          <li>
            <Button
              variant="outlined"
              color="primary"
              size="medium"
              sx={{
                borderRadius: "9999px",
                textTransform: "none",
                px: 3,
                fontWeight: 600,
                ":hover": {
                  backgroundColor: "#eff6ff",
                },
              }}
              onClick={handleProfileClick} // Thêm onClick để điều hướng
            >
              Hồ sơ
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Header;