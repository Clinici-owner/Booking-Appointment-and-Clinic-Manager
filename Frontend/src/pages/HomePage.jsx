import React from "react";

import Banner from "../assets/images/Banner.png";

import {
  LocationOn,
  Phone,
  Email,
  AccessTime,
  Facebook,
  Instagram,
  Twitter,
} from "@mui/icons-material";

function HomePage() {
  return (
    <div>
      <div
        className="relative w-full rounded-xl h-[400px] bg-cover bg-center"
        style={{ backgroundImage: `url(${Banner})` }}
      >
        {/* Overlay mờ */}
        <div className="absolute inset-0 bg-[#1e293b]/70 rounded-xl "></div>

        {/* Nội dung */}
        <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col justify-center px-6 text-white">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Chăm sóc sức khỏe <br />
            chất lượng cao
          </h1>
          <p className="text-base text-slate-200 mb-6 max-w-xl">
            Phòng khám đa khoa Phúc Hưng với đội ngũ bác sĩ giàu kinh nghiệm,
            trang thiết bị hiện đại cam kết mang đến cho bạn dịch vụ y tế tốt
            nhất.
          </p>
          <div className="flex space-x-4">
            <button className="bg-custom-blue text-white font-semibold px-6 py-2 rounded-xl shadow hover:bg-custom-bluehover2 transition duration-300 hover:cursor-pointer">
              Đặt khám ngay
            </button>
            <button className="bg-white text-custom-blue font-semibold px-6 py-2 rounded-xl shadow hover:bg-gray-100 transition duration-300">
              Xem dịch vụ
            </button>
          </div>
        </div>
      </div>
      <div>
        {/* Giới thiệu phòng khám */}
        <section className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-custom-blue mb-3">
            Tại sao chọn Phúc Hưng Clinic?
          </h2>
          <p className="text-gray-600 mb-10 max-w-xl mx-auto">
            Chúng tôi cam kết mang đến cho bạn dịch vụ y tế chất lượng với những
            ưu điểm vượt trội
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {/* Box 1 */}
            <div className="bg-custom-blue-bg hover:bg-custom-bluehover rounded-xl p-8 flex-1 max-w-sm sm:max-w-none mx-auto transition duration-300 ease-in-out hover:shadow-lg">
              <div className="w-14 h-14 rounded-full bg-[#cbdcff] flex items-center justify-center mx-auto mb-5">
                <i className="fas fa-user-md text-custom-blue text-xl"></i>
              </div>
              <h3 className="text-custom-blue font-semibold text-lg mb-3">
                Đội ngũ bác sĩ giỏi
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Các bác sĩ có trình độ chuyên môn cao, giàu kinh nghiệm, tận tâm
                với bệnh nhân.
              </p>
            </div>

            {/* Box 2 */}
            <div className="bg-custom-blue-bg hover:bg-custom-bluehover rounded-xl p-8 flex-1 max-w-sm sm:max-w-none mx-auto transition duration-300 ease-in-out hover:shadow-lg">
              <div className="w-14 h-14 rounded-full bg-[#d9f3d9] flex items-center justify-center mx-auto mb-5">
                <i className="fas fa-microscope text-custom-blue text-xl"></i>
              </div>
              <h3 className="text-custom-blue font-semibold text-lg mb-3">
                Trang thiết bị hiện đại
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Hệ thống máy móc, thiết bị y tế được nhập khẩu từ các nước có
                nền y học phát triển.
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-custom-blue-bg hover:bg-custom-bluehover rounded-xl p-8 flex-1 max-w-sm sm:max-w-none mx-auto transition duration-300 ease-in-out hover:shadow-lg">
              <div className="w-14 h-14 rounded-full bg-[#e9d9f9] flex items-center justify-center mx-auto mb-5">
                <i className="fas fa-calendar-check text-custom-red text-xl"></i>
              </div>
              <h3 className="text-custom-blue font-semibold text-lg mb-3">
                Tiết kiệm thời gian
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Đặt lịch trực tuyến dễ dàng, không phải chờ đợi lâu, được khám
                đúng giờ đã hẹn.
              </p>
            </div>
          </div>
        </section>

        {/* Dịch vụ nổi bật */}
        <section className="py-16 bg-gray-50" id="services">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">
                Dịch vụ y tế
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Phúc Hưng Clinic cung cấp đa dạng các dịch vụ y tế chất lượng
                cao
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-lg">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <i className="fas fa-heartbeat text-2xl text-blue-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800">
                    Khám tổng quát
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Kiểm tra sức khỏe toàn diện, phát hiện sớm các bệnh lý tiềm
                  ẩn.
                </p>
                <a
                  href="#"
                  className="text-green-600 font-medium flex items-center"
                >
                  Xem chi tiết{" "}
                  <i className="fas fa-chevron-right ml-2 text-sm"></i>
                </a>
              </div>
            </div>

            <div className="text-center mt-10">
              <a
                href="#"
                className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center"
              >
                Xem tất cả dịch vụ{" "}
                <i className="fas fa-chevron-right ml-2 text-sm"></i>
              </a>
            </div>
          </div>
        </section>

        {/* Liên hệ */}
        <section className="py-16 bg-white" id="contact">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Thông tin liên hệ */}
            <div>
              <h2 className="text-3xl font-bold text-custom-blue mb-6">
                Thông tin liên hệ
              </h2>

              <ul className="space-y-5">
                <li className="flex items-start">
                  <span className="bg-blue-100 p-2 rounded-lg mr-4">
                    <LocationOn className="text-blue-600" />
                  </span>
                  <div>
                    <p className="font-medium">Địa chỉ</p>
                    <p className="text-gray-700">
                      06 Cao Bá Quát, P. Nghĩa Chánh, TP. Quảng Ngãi
                    </p>
                  </div>
                </li>

                <li className="flex items-start">
                  <span className="bg-green-100 p-2 rounded-lg mr-4">
                    <Phone className="text-green-600" />
                  </span>
                  <div>
                    <p className="font-medium">Cấp cứu</p>
                    <p className="text-gray-700">
                      0255 3 713 555 - Hotline: 1900 099 915
                    </p>
                  </div>
                </li>

                <li className="flex items-start">
                  <span className="bg-yellow-100 p-2 rounded-lg mr-4">
                    <Email className="text-yellow-600" />
                  </span>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-700">phuchungclinic@gmail.com</p>
                  </div>
                </li>

                <li className="flex items-start">
                  <span className="bg-purple-100 p-2 rounded-lg mr-4">
                    <AccessTime className="text-purple-600" />
                  </span>
                  <div>
                    <p className="font-medium">Giờ làm việc</p>
                    <p className="text-gray-700">
                      Thứ 2 - Thứ 7: 7:30 - 20:00 <br />
                      Chủ nhật: 7:30 - 12:00
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Google Map */}
            <div>
              <iframe
                src="https://www.google.com/maps?q=15.111452170039085,108.8159676896338&hl=vi&z=15&output=embed"
                width="100%"
                height="380"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                className="rounded-xl shadow-md"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
