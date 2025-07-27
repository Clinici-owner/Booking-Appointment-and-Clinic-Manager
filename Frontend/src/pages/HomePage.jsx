import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Banner from "../assets/images/Banner.png";

import { LocationOn, Phone, Email, AccessTime } from "@mui/icons-material";

import { getOpenSpecialties } from "../services/specialtyService";
import { healthPackageService } from "../services/healthPackageService";
import { DoctorService } from "../services/doctorService";
import { listNews } from "../services/newsService";

import SpecialtiesCard from "../components/SpecialtyCard";
import HealthPackageList from "../components/HealthPackageList";
import NewsCard from "../components/NewsCard";

function HomePage() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);
  const [healthPackages, setHealthPackages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [news, setNews] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const data = await getOpenSpecialties();
        setSpecialties(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching specialties:", error);
      }
    };

    const fetchHealthPackages = async () => {
      try {
        const data = await healthPackageService.getAllHealthPackages();
        setHealthPackages(data.data.slice(0, 3) || []);
      } catch (error) {
        console.error("Error fetching health packages:", error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const data = await DoctorService.getAllDoctors();
        setDoctors(data.doctors.slice(0, 4) || []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    const fetchNews = async () => {
      try {
        const data = await listNews();
        console.log("Fetched news:", data);
        setNews(data.data.slice(0, 3) || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
    fetchDoctors();
    fetchSpecialties();
    fetchHealthPackages();
  }, []);

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
            <button
              className="bg-custom-blue text-white font-semibold px-6 py-2 rounded-xl shadow hover:bg-custom-bluehover2 transition duration-300 hover:cursor-pointer"
              onClick={() => navigate("/specialties")}
            >
              Đặt khám ngay
            </button>
            <button
              className="bg-white text-custom-blue font-semibold px-6 py-2 rounded-xl shadow hover:bg-gray-100 transition duration-300"
              onClick={() => navigate("/health-packages")}
            >
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
        <section class="py-16 bg-gray-50" id="services">
          <div class="container mx-auto px-4">
            <div class="text-center mb-16">
              <h2 class="text-3xl font-bold text-blue-800 mb-4">
                Chuyên khoa y tế
              </h2>
              <p class="text-gray-600 max-w-2xl mx-auto">
                Phúc Hưng Clinic cung cấp đa dạng các chuyên khoa y tế chất
                lượng cao
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {specialties.map((specialty) => (
                <SpecialtiesCard
                  key={specialty._id}
                  id={specialty._id}
                  name={specialty.specialtyName}
                  description={specialty.descspecialty}
                  logo={specialty.logo}
                />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/specialties"
                className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center"
              >
                Xem tất cả chuyên khoa{" "}
                <i className="fas fa-chevron-right ml-2 text-sm"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* Gói khám sức khỏe */}
        <section className="py-16 bg-white" id="health-packages">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">
                Gói khám sức khỏe
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Chúng tôi cung cấp các gói khám sức khỏe toàn diện, phù hợp với
                nhu cầu của từng đối tượng
              </p>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {healthPackages.length === 0 ? (
                <div className="text-center text-gray-500">
                  Không có gói khám sức khỏe nào hiện có.
                </div>
              ) : (
                <HealthPackageList
                  user={user}
                  healthPackages={healthPackages}
                  showDeleteButton={false}
                  showToggleButton={false}
                  showDetailButton={false} // Ẩn nút chi tiết cho user thường
                />
              )}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/health-packages"
                className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center"
              >
                Xem tất cả gói khám{" "}
                <i className="fas fa-chevron-right ml-2 text-sm"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* Đội ngũ bác sĩ */}
        <section class="py-16 bg-gray-50">
          <div class="container mx-auto px-4">
            <div class="text-center mb-16">
              <h2 class="text-3xl font-bold text-blue-800 mb-4">
                Đội ngũ bác sĩ
              </h2>
              <p class="text-gray-600 max-w-2xl mx-auto">
                Gặp gỡ các chuyên gia y tế giàu kinh nghiệm của chúng tôi
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {doctors.map((doctor) => (
                <div class="bg-white rounded-xl overflow-hidden shadow-md doctor-card transition">
                  <img
                    src={doctor?.avatar}
                    alt="Bác sĩ Nguyễn Thị Mai"
                    class="w-full h-64 object-cover"
                  />
                  <div class="p-6">
                    <h3 class="text-xl font-bold text-blue-800">
                      {doctor?.fullName || "Chưa xác định"}
                    </h3>
                    <p className="text-green-600 mb-3">
                      Chuyên khoa{" "}
                      {doctor?.profile?.specialties[0]?.specialtyName ||
                        "Chưa xác định"}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      <span dangerouslySetInnerHTML={{ __html: doctor?.profile?.description }} />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div class="text-center mt-10">
              <a
                href="/doctors"
                class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium inline-block transition"
              >
                Xem tất cả bác sĩ
              </a>
            </div>
          </div>
        </section>

        {/* Đặt lịch khám */}
        <section className="py-16 bg-gray-50" id="appointment">
          <div className="relative bg-custom-blue rounded-xl p-10 max-w-7xl mx-auto overflow-hidden">
            <h2 className="text-white font-extrabold text-2xl mb-3 max-w-lg">
              Đặt lịch khám ngay hôm nay
            </h2>
            <p className="text-[#dbe1ff] max-w-xl text-base leading-relaxed">
              Đặt lịch trực tuyến dễ dàng và nhanh chóng. Chỉ cần điền thông tin
              cơ bản, chúng tôi sẽ liên hệ xác nhận lịch hẹn trong thời gian sớm
              nhất.
            </p>
            <img
              src="https://storage.googleapis.com/a1aa/image/2037a6bb-bcb9-4f4d-21b0-915ae5082e3b.jpg"
              alt="Medical icon with a cross and hospital building in blue tone"
              aria-hidden="true"
              className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none"
              width={120}
              height={120}
              style={{ width: "120px", height: "120px" }} // React cần viết dưới dạng object
            />
            <Link
              to="/specialties"
              className="absolute right-10 top-1/2 -translate-y-1/2 bg-white text-[#3b4ac1] font-semibold rounded-lg px-6 py-3 hover:bg-[#e6e9ff] transition"
            >
              Đặt lịch ngay
            </Link>
          </div>
        </section>

        {/* Đánh giá của khách hàng */}
        <section className="py-16 bg-white" id="reviews">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-custom-blue mb-6 text-center">
              Đánh giá của khách hàng
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Đánh giá 1 */}
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Dịch vụ tuyệt vời, bác sĩ rất tận tâm và chuyên nghiệp. Tôi
                  đã cảm thấy thoải mái khi đến khám tại đây."
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src="https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                    alt="Nguyễn Văn A"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">Nguyễn Văn A</p>
                    <p className="text-sm text-gray-500">Khách hàng</p>
                  </div>
                </div>
              </div>

              {/* Đánh giá 2 */}
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Tôi rất hài lòng với dịch vụ khám bệnh tại Phúc Hưng Clinic.
                  Không gian sạch sẽ, nhân viên thân thiện."
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src="https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                    alt="Trần Thị B"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">Trần Thị B</p>
                    <p className="text-sm text-gray-500">Khách hàng</p>
                  </div>
                </div>
              </div>
              {/* Đánh giá 3 */}
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Phòng khám rất chuyên nghiệp, tôi đã được tư vấn và điều trị
                  tận tình. Tôi sẽ giới thiệu cho bạn bè và người thân."
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src="https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                    alt="Lê Văn C"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">Lê Văn C</p>
                    <p className="text-sm text-gray-500">Khách hàng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tin tức & sự kiện */}
        <section className="py-16 bg-gray-50" id="news">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-custom-blue mb-6 text-center">
              Tin tức & Sự kiện
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-lg">
                  <NewsCard
                    key={item._id}
                    news={item}
                    isAdmin={user?.role === "admin"}
                  />
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/news"
                className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center"
              >
                Xem tất cả tin tức{" "}
                <i className="fas fa-chevron-right ml-2 text-sm"></i>
              </Link>
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
