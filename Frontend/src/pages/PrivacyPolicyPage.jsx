import React from "react";

import BannerName from "../components/BannerName";
import { Container } from "@mui/material";

function PrivacyPolicyPage() {
  return (
    <div>
      <BannerName Text="Chính sách bảo mật" />
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <Container maxWidth="lg">
          {/* 1. Mục đích và phạm vi thu thập */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              1. Mục đích và phạm vi thu thập
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Phòng khám Đa khoa Phúc Hưng cam kết bảo vệ thông tin cá nhân của
              khách hàng. Chúng tôi chỉ thu thập những thông tin cần thiết để
              phục vụ quá trình khám chữa bệnh và chăm sóc sức khỏe bao gồm: họ
              tên, giới tính, ngày sinh, địa chỉ liên hệ, số điện thoại, địa chỉ
              email, tiền sử bệnh lý, kết quả xét nghiệm, hình ảnh y khoa, và
              các thông tin liên quan đến hồ sơ bệnh án.
            </p>
          </div>

          {/* 2. Phạm vi sử dụng thông tin */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              2. Phạm vi sử dụng thông tin
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Thông tin cá nhân thu thập được sẽ được sử dụng để:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
              <li>
                Thực hiện các dịch vụ y tế: khám bệnh, chẩn đoán, điều trị và
                chăm sóc sức khỏe.
              </li>
              <li>
                Liên hệ khách hàng để nhắc lịch hẹn, tái khám, thông báo kết quả
                xét nghiệm.
              </li>
              <li>
                Cải thiện trải nghiệm khách hàng và phát triển các dịch vụ chăm
                sóc tốt hơn.
              </li>
              <li>
                Tuân thủ các quy định của pháp luật về lưu trữ và báo cáo hồ sơ
                bệnh án.
              </li>
            </ul>
          </div>

          {/* 3. Cam kết bảo mật */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              3. Cam kết bảo mật thông tin cá nhân
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Chúng tôi áp dụng nhiều biện pháp kỹ thuật và tổ chức nhằm bảo vệ
              dữ liệu cá nhân khỏi việc truy cập trái phép hoặc bị rò rỉ. Nhân
              viên y tế và quản trị hệ thống đều được đào tạo về bảo mật và cam
              kết giữ bí mật thông tin bệnh nhân tuyệt đối. Thông tin của bạn sẽ
              không được chia sẻ với bên thứ ba nếu không có sự đồng ý trước
              bằng văn bản.
            </p>
          </div>

          {/* 4. Quyền của khách hàng */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              4. Quyền của khách hàng
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Yêu cầu cung cấp thông tin cá nhân đã lưu trữ.</li>
              <li>Yêu cầu chỉnh sửa hoặc xóa bỏ dữ liệu không chính xác.</li>
              <li>Phản hồi về việc sử dụng dữ liệu cá nhân.</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Khách hàng có thể gửi yêu cầu về quyền riêng tư thông qua email:
              <strong> phuchungclinic@gmail.com</strong> hoặc đến trực tiếp tại
              phòng khám.
            </p>
          </div>

          {/* 5. Lưu trữ thông tin */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              5. Thời gian lưu trữ thông tin
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Tất cả hồ sơ bệnh án, thông tin cá nhân sẽ được lưu trữ theo quy
              định pháp luật tối thiểu 10 năm kể từ ngày điều trị cuối cùng. Sau
              thời gian đó, dữ liệu sẽ được xóa hoặc ẩn đi theo quy trình bảo
              mật.
            </p>
          </div>

          {/* 6. Thay đổi chính sách */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              6. Cập nhật chính sách
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Phòng khám có thể điều chỉnh chính sách bảo mật bất kỳ lúc nào để
              phù hợp với yêu cầu thực tiễn và quy định của pháp luật. Mọi thay
              đổi sẽ được thông báo trên website chính thức:{" "}
              <a
                href="https://phuchungclinic.vn"
                className="text-blue-600 underline"
              >
                phuchungclinic@gmail.com
              </a>
              .
            </p>
          </div>

          {/* 7. Thông tin liên hệ */}
          <div>
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              7. Thông tin liên hệ
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Nếu quý khách có thắc mắc, khiếu nại hoặc yêu cầu liên quan đến
              chính sách bảo mật, vui lòng liên hệ:
            </p>
            <ul className="list-inside mt-2 text-gray-700 space-y-1">
              <li>
                <strong>Địa chỉ:</strong> 06 Cao Bá Quát, TP. Quảng Ngãi
              </li>
              <li>
                <strong>Hotline:</strong> 1900 099 915
              </li>
              <li>
                <strong>Email:</strong> phuchungclinic@gmail.com
              </li>
            </ul>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default PrivacyPolicyPage;
