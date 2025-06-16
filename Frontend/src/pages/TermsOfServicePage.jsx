import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BannerName from "../components/BannerName";
import { Container } from "@mui/material";

function TermsOfServicePage() {
  return (
    <div>
      <Header />
      <BannerName Text="Điều khoản dịch vụ" />
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <Container maxWidth="lg">
          {/* 1. Giới thiệu */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              1. Giới thiệu
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Trang web của Phòng khám Đa khoa Phúc Hưng được xây dựng nhằm cung cấp thông tin
              về dịch vụ khám chữa bệnh, lịch hẹn, tư vấn sức khỏe và các nội dung liên quan khác.
              Khi bạn truy cập và sử dụng website, đồng nghĩa với việc bạn đã đồng ý với các điều khoản dưới đây.
            </p>
          </div>

          {/* 2. Quyền và trách nhiệm của người dùng */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              2. Quyền và trách nhiệm của người dùng
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Người dùng có quyền truy cập thông tin, đặt lịch hẹn và gửi yêu cầu hỗ trợ.</li>
              <li>Cam kết cung cấp thông tin chính xác, đầy đủ và trung thực khi điền biểu mẫu.</li>
              <li>Không được sử dụng website vào các mục đích gây hại, vi phạm pháp luật, phá hoại hệ thống hoặc giả mạo thông tin.</li>
              <li>Tôn trọng quyền riêng tư, bản quyền và tài sản trí tuệ của phòng khám và các bên liên quan.</li>
            </ul>
          </div>

          {/* 3. Quyền và nghĩa vụ của phòng khám */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              3. Quyền và nghĩa vụ của Phòng khám
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Phòng khám có quyền điều chỉnh, tạm ngưng hoặc ngừng cung cấp một phần hoặc toàn bộ dịch vụ website
              mà không cần thông báo trước trong trường hợp bảo trì hoặc gặp sự cố.
              Chúng tôi có nghĩa vụ bảo vệ thông tin người dùng, cung cấp dịch vụ chính xác và hỗ trợ kịp thời khi nhận được phản hồi từ khách hàng.
            </p>
          </div>

          {/* 4. Bảo mật và dữ liệu cá nhân */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              4. Bảo mật và dữ liệu cá nhân
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Mọi thông tin cá nhân thu thập từ khách hàng sẽ được lưu trữ và bảo mật nghiêm ngặt
              theo Chính sách Bảo mật của Phòng khám. Người dùng có thể tham khảo đầy đủ chính sách tại trang
              <a href="/chinh-sach-bao-mat" className="text-blue-600 underline ml-1">Chính sách bảo mật</a>.
            </p>
          </div>

          {/* 5. Sở hữu trí tuệ */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              5. Quyền sở hữu trí tuệ
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Tất cả nội dung trên trang web như văn bản, hình ảnh, logo, video, tài liệu y tế... đều thuộc sở hữu của
              Phòng khám Đa khoa Phúc Hưng hoặc được cấp phép hợp pháp. Việc sao chép, phát tán, sử dụng cho mục đích thương mại
              mà không có sự đồng ý bằng văn bản là hành vi vi phạm pháp luật.
            </p>
          </div>

          {/* 6. Thay đổi điều khoản */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              6. Thay đổi điều khoản
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Phòng khám có quyền điều chỉnh nội dung Điều khoản dịch vụ bất kỳ lúc nào để phù hợp với pháp luật và nhu cầu hoạt động.
              Người dùng có trách nhiệm theo dõi cập nhật mới nhất được công bố tại website chính thức của chúng tôi.
            </p>
          </div>

          {/* 7. Liên hệ */}
          <div>
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              7. Thông tin liên hệ
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Nếu bạn có bất kỳ câu hỏi nào liên quan đến Điều khoản dịch vụ, vui lòng liên hệ:
            </p>
            <ul className="list-inside mt-2 text-gray-700 space-y-1">
              <li><strong>Địa chỉ:</strong> 06 Cao Bá Quát, TP. Quảng Ngãi</li>
              <li><strong>Hotline:</strong> 1900 099 915</li>
              <li><strong>Email:</strong> phuchungclinic@gmail.com</li>
            </ul>
          </div>
        </Container>
      </section>
      <Footer />
    </div>
  );
}

export default TermsOfServicePage;
