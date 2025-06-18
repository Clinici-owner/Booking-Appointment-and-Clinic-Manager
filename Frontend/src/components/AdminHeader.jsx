import React from "react";
import { Button } from "@mui/material";

import { Link } from "react-router-dom";

import PersonIcon from "@mui/icons-material/Person";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import LogoMini from "../assets/images/LogoMini.png"; // Đảm bảo đường dẫn đúng đến logo

function AdminHeader() {
  const userData = JSON.parse(sessionStorage.getItem("user"));

  return (
    <div className="fixed top-0 left-0 w-full z-50">
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
            {userData ? (
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <MenuButton className="rounded-full py-1 px-3 font-semibold cursor-pointer transition duration-300 hover:shadow-md hover:bg-[#eff6ff] normal-case border border-blue-500 text-custom-blue flex items-center focus:outline-none">
                    <PersonIcon className="inline-block mr-2" />
                    {userData.fullName || userData.email}
                  </MenuButton>
                </div>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <div className="py-1">
                    <MenuItem>
                      <a
                        href="#"
                        className="flex flex-row align-center block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                      >
                        <AccountCircleIcon
                          className=" mr-2 text-custom-blue"
                          style={{ fontSize: "46px" }}
                        />
                        <div>
                          <span className="font-normal  ">Xin chào,</span>
                          <br />
                          <span className="text-custom-blue font-semibold text-lg ">
                            {userData.fullName || userData.email}
                          </span>
                        </div>
                      </a>
                    </MenuItem>
                  </div>
                  <div className="py-1">
                    <MenuItem>
                      <a
                        href="#"
                        className="group block px-4 py-2 text-sm text-custom-red data-focus:bg-gray-100  data-focus:outline-hidden"
                        onClick={() => {
                          sessionStorage.removeItem("user");
                          window.location.href = "/login";
                        }}
                      >
                        <div className="inline-block mr-2 transition-transform duration-300 group-hover:animate-slide-shake">
                          <LogoutIcon className="text-custom-red" />
                        </div>
                        Đăng xuất
                      </a>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            ) : (
              <Link to="/login">
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
                >
                  Đăng nhập
                </Button>
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default AdminHeader;
