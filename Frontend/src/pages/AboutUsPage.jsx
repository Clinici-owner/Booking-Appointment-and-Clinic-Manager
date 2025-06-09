import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BannerName from "../components/BannerName";
import { Container } from "@mui/material";

import HinhThanhvaPhatTrien from "../assets/images/HinhThanhvaPhatTrien.jpg";
import PhuongCham1 from "../assets/images/PhuongCham1.jpg";
import TamNhin from "../assets/images/TamNhin.jpg";
import GiaTriCotLoi from "../assets/images/GiaTriCotLoi.jpg";

function AboutUsPage() {
  return (
    <div>
      <Header />
      <BannerName Text="Về chúng tôi" />
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <Container maxWidth="lg">
          {/* Hình thành & Phát triển */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              Hình thành & Phát triển
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Phòng khám Đa khoa Phúc Hưng là một cơ sở y tế tư nhân trực thuộc
              Công ty Cổ phần Phúc Hưng, tọa lạc tại số 06 Cao Bá Quát, TP.
              Quảng Ngãi – trung tâm của thành phố. Phòng khám chính thức đi vào
              hoạt động từ tháng 3 năm 2019 theo Giấy phép hành nghề khám, chữa
              bệnh số 246/BYT-GPHĐ được cấp bởi Bộ Y tế.
              <br />
              <br />
              Với mục tiêu phục vụ cộng đồng bằng các dịch vụ y tế chất lượng
              cao, Phòng khám Đa khoa Phúc Hưng là phòng khám đa khoa tư nhân
              đầu tiên tại tỉnh Quảng Ngãi hoạt động theo mô hình hiện đại, kết
              hợp giữa chuyên môn sâu và dịch vụ thân thiện.
            </p>
            <img
              src={HinhThanhvaPhatTrien}
              alt="Hình thành và phát triển"
              className="w-[800px] h-auto rounded-lg mt-6 mx-auto shadow-lg"
            />
          </div>

          {/* Phương châm hoạt động */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              Phương châm hoạt động
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Với phương châm{" "}
              <span className="italic font-medium">“Chuyên môn là y đức”</span>,
              Phòng khám không ngừng cải tiến quy trình và nâng cao chất lượng
              khám chữa bệnh. Đội ngũ chuyên môn bao gồm:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-1 text-gray-700">
              <li>30+ bác sĩ chuyên khoa, bác sĩ đa khoa</li>
              <li>15+ dược sĩ phụ trách cấp phát thuốc</li>
              <li>50+ điều dưỡng, kỹ thuật viên y tế</li>
              <li>
                Đội ngũ nhân viên tiếp đón, tư vấn và hỗ trợ bệnh nhân chu đáo
              </li>
            </ul>
            <img
              src={PhuongCham1}
              alt="Phương châm 1"
              className="w-[800px] h-auto rounded-lg mt-6 mx-auto shadow-lg"
            />
          </div>

          {/* Tầm nhìn & Sứ mệnh */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              Tầm nhìn & Sứ mệnh
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              <strong className="text-custom-blue">Tầm nhìn:</strong>
              <br />
              Phòng khám Đa khoa Phúc Hưng hướng tới trở thành đơn vị y tế tư
              nhân hàng đầu khu vực miền Trung, được người dân tin tưởng lựa
              chọn trong mọi nhu cầu chăm sóc sức khỏe. Chúng tôi không ngừng
              đổi mới và tiên phong ứng dụng các công nghệ y tế hiện đại, từ
              thiết bị chẩn đoán hình ảnh, xét nghiệm đến điều trị chuyên sâu,
              nhằm mang lại hiệu quả tối ưu và trải nghiệm dịch vụ tốt nhất cho
              bệnh nhân.
              <br />
              Với khát vọng phát triển bền vững, Phúc Hưng mong muốn không chỉ
              là nơi khám chữa bệnh mà còn là địa chỉ y tế uy tín, góp phần nâng
              cao chất lượng sống của cộng đồng, đồng hành cùng sự phát triển
              chung của ngành y tế Việt Nam.
              <br />
              <br />
              <strong className="text-custom-blue">Sứ mệnh:</strong>
              <br />
              Sứ mệnh của Phòng khám Phúc Hưng là đáp ứng mọi nhu cầu chăm sóc
              sức khỏe của người dân một cách toàn diện và hiệu quả nhất. Chúng
              tôi cam kết mang đến dịch vụ y tế với tiêu chí:
              <br />
              <ul className="list-disc list-inside mt-4 space-y-1 text-gray-700">
                <li>
                  <span className="font-medium">An toàn: </span> Mọi quy trình
                  khám chữa bệnh đều tuân thủ nghiêm ngặt các tiêu chuẩn an toàn
                  cao nhất.
                </li>
                <li>
                  <span className="font-medium">Nhanh chóng: </span> Đáp ứng kịp
                  thời mọi yêu cầu, giảm thiểu thời gian chờ đợi, tạo sự thuận
                  tiện cho người bệnh.
                </li>
                <li>
                  <span className="font-medium">Chính xác: </span> Đầu tư trang
                  thiết bị hiện đại và đội ngũ chuyên môn cao nhằm nâng cao độ
                  chính xác trong chẩn đoán và điều trị.
                </li>
                <li>
                  <span className="font-medium">Tận tâm: </span> Phục vụ bằng cả
                  trái tim, lấy sự hài lòng và sức khỏe của người bệnh làm trọng
                  tâm mọi hoạt động.
                </li>
              </ul>
            </p>
            <img
              src={TamNhin}
              alt="Tầm nhìn"
              className="w-[800px] h-auto rounded-lg mt-6 mx-auto shadow-lg"
            />
          </div>

          {/* Giá trị cốt lõi */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              Giá trị cốt lõi
            </h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>
                <span className="font-medium">Chuyên nghiệp – Tận tâm:</span>{" "}
                Luôn duy trì phong cách làm việc chuẩn mực, đặt trách nhiệm và
                sự tận tâm trong từng dịch vụ y tế cung cấp.
              </li>
              <li>
                <span className="font-medium">Chính xác – Minh bạch:</span> Mọi
                kết quả khám, chẩn đoán và tư vấn đều được đảm bảo độ chính xác
                cao và minh bạch tuyệt đối, tạo sự tin tưởng tuyệt đối từ bệnh
                nhân.
              </li>
              <li>
                <span className="font-medium">An toàn – Đạo đức:</span> Cam kết
                thực hiện mọi quy trình với tiêu chuẩn an toàn cao nhất, đồng
                thời tuân thủ nghiêm ngặt các chuẩn mực đạo đức y khoa.
              </li>
              <li>
                <span className="font-medium">
                  Tiên tiến – Phục vụ cộng đồng:
                </span>{" "}
                Không ngừng ứng dụng công nghệ mới, cập nhật kiến thức y học
                hiện đại nhằm nâng cao chất lượng dịch vụ và đóng góp tích cực
                cho sức khỏe cộng đồng.
              </li>
            </ul>
            <img
              src={GiaTriCotLoi}
              alt="Giá trị cốt lõi"
              className="w-[800px] h-auto rounded-lg mt-6 mx-auto shadow-lg"
            />
          </div>

          {/* Đội ngũ nhân sự */}
          <div>
            <h2 className="text-2xl font-semibold text-custom-blue mb-4">
              Đội ngũ y bác sĩ & nhân viên
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Tại Phòng khám Đa khoa Phúc Hưng, con người là yếu tố trung tâm
              trong hành trình chăm sóc sức khỏe toàn diện. Chúng tôi tự hào quy
              tụ một đội ngũ bác sĩ chuyên khoa giỏi, điều dưỡng tận tâm, cùng
              các kỹ thuật viên y tế lành nghề, không chỉ được đào tạo bài bản
              tại các trường đại học y danh tiếng trong và ngoài nước, mà còn
              không ngừng học hỏi, cập nhật kiến thức và công nghệ mới nhằm phục
              vụ người bệnh một cách tốt nhất.
              <br />
              <br />
              Mỗi thành viên trong đội ngũ đều mang trong mình sứ mệnh “lấy
              người bệnh làm trung tâm”, không chỉ điều trị bằng chuyên môn mà
              còn bằng sự thấu hiểu, đồng cảm và trách nhiệm. Chúng tôi luôn tin
              rằng, y đức chính là nền tảng vững chắc của y học, và việc duy trì
              tinh thần ấy là điều kiện tiên quyết để tạo dựng niềm tin nơi bệnh
              nhân và cộng đồng.
            </p>
            <br />
            <br />
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>
                <span className="font-medium">Bác sĩ chuyên khoa </span> tại
                Phúc Hưng không chỉ có trình độ chuyên môn cao mà còn nhiều năm
                kinh nghiệm công tác tại các bệnh viện tuyến đầu, luôn sẵn sàng
                lắng nghe, tư vấn tận tình và đưa ra phác đồ điều trị hiệu quả,
                phù hợp nhất với từng bệnh nhân.
              </li>
              <br />
              <li>
                <span className="font-medium">Đội ngũ điều dưỡng </span> được
                đào tạo bài bản, chuyên nghiệp, luôn chăm sóc bệnh nhân bằng sự
                nhẹ nhàng, chu đáo, tận tâm như người thân trong gia đình.
              </li>
              <br />
              <li>
                <span className="font-medium">
                  Kỹ thuật viên và nhân viên hỗ trợ{" "}
                </span>{" "}
                luôn làm việc chính xác, nhanh chóng, đảm bảo các quy trình khám
                – chẩn đoán – xét nghiệm – điều trị diễn ra thuận lợi và an toàn
                tuyệt đối.
              </li>
            </ul>
          </div>
        </Container>
      </section>
      <Footer />
    </div>
  );
}

export default AboutUsPage;
