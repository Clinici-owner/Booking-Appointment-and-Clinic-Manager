import React from "react";

import { Button, Divider } from "@mui/material";
import {
  Facebook,
  YouTube,
  Instagram,
  Apple,
  Android,
  KeyboardArrowUp,
  Whatshot,
} from "@mui/icons-material";

import LogoMini from "../assets/images/LogoMini.png";

function Footer() {
  return (
    <footer className="bg-custom-blue px-20 text-white px-6 pt-10 pb-1 rounded-t-xl">
      <div className="flex flex-row items-start justify-between sm:grid-cols-2 md:grid-cols-4 gap-10 mb-5">
        {/* Info */}
        <div>
          <div className="flex items-center space-x-2 mb-3 pb-3">
            <img
              src={LogoMini}
              alt="Phòng khám Phúc Hưng logo with red and blue colors and medical cross"
              className="w-16 h-16 rounded-full"
            />
            <div className="leading-tight flex flex-col">
              <h2 className="text-white font-bold text-[32px] -mt-1">
                Phúc Hưng
              </h2>
              <span className="text-white text-[16px] text-lg">
                Chuyên môn là Y đức
              </span>
            </div>
          </div>
          <p className="max-w-[280px] leading-relaxed text-base mb-4">
            Phòng khám đa khoa chất lượng cao với đội ngũ bác sĩ giỏi, trang
            thiết bị hiện đại.
          </p>
          <p className="max-w-[280px] text-base leading-relaxed">
            MST: 0314526789
          </p>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white font-semibold mb-4">Dịch vụ</h3>
          <ul className="space-y-2 text-base">
            <li>Khám tổng quát</li>
            <li>Khám nhi</li>
            <li>Khám phụ khoa</li>
            <li>Khám nam khoa</li>
            <li>Tai mũi họng</li>
            <li>Răng hàm mặt</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
          <ul className="space-y-2 text-base">
            <li>Trang chủ</li>
            <li>Giới thiệu</li>
            <li>Bác sĩ</li>
            <li>Dịch vụ</li>
            <li>Tin tức</li>
            <li>Liên hệ</li>
          </ul>
        </div>

        {/* Social + App */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Kết nối với chúng tôi
          </h3>
          <div className="flex space-x-4 mb-6">
            {[Facebook, YouTube, Instagram, Whatshot].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="bg-[#3a4edc] w-10 h-10 rounded-full flex items-center justify-center text-white text-lg hover:bg-[#2a3bb8]"
              >
                <Icon fontSize="inherit" />
              </a>
            ))}
          </div>
          <h3 className="text-white font-bold mb-3">Tải ứng dụng</h3>
          <div className="flex space-x-4">
            <a
              href="#"
              className="bg-black rounded-lg w-28 h-28 flex flex-col items-center justify-center text-white text-center px-3 py-4"
            >
              <span className="text-xs">
                Download
                <br />
                on the
              </span>
              <Apple className="text-3xl my-1" />
              <span className="font-bold text-lg leading-tight">
                App
                <br />
                Store
              </span>
            </a>
            <a
              href="#"
              className="bg-black rounded-lg w-28 h-28 flex flex-col items-center justify-center text-white text-center px-3 py-4"
            >
              <span className="text-xs">Get it on</span>
              <Android className="text-3xl my-1" />
              <span className="font-bold text-lg leading-tight">
                Google
                <br />
                Play
              </span>
            </a>
          </div>
        </div>
      </div>

      <Divider className="!border-t !border-[#3a4edc] mt-10" />

      <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-[#a3bffa] pt-1">
        <div className="flex items-center space-x-2 mb-3 sm:mb-0">
          <span>© 2025 Phòng Khám Đa khoa Phúc Hưng. All rights reserved.</span>
        </div>
        <div className="flex space-x-6">
          <a href="/privacypolicy" className="hover:underline">
            Chính sách bảo mật
          </a>
          <a href="/termsofservice" className="hover:underline">
            Điều khoản sử dụng
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
