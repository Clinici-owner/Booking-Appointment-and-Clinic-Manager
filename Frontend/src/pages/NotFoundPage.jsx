import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#B9D4FF] flex items-center justify-center px-4 py-12">
      <div className="bg-custom-blue max-w-5xl w-full flex flex-col md:flex-row items-center justify-between shadow-xl rounded-xl p-8 text-white">
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-bold mb-4">Oops!</h1>
          <h2 className="text-2xl font-semibold mb-4">Không tìm thấy trang</h2>
          <p className="text-sm mb-4">
            Có vẻ như bạn đã truy cập một đường dẫn không đúng hoặc trang này đã bị xóa. 
            Đừng lo, bạn có thể quay lại trang chủ để tiếp tục khám phá.
          </p>
          <Link to="/">
            <button className="bg-white text-[#951B37] font-semibold px-6 py-2 rounded-full hover:bg-gray-200 transition hover:cursor-pointer">
              Về trang chủ
            </button>
          </Link>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <img
            src="https://media.istockphoto.com/vectors/connection-error-icons-vector-id854932976?k=6&m=854932976&s=612x612&w=0&h=BZL-VqnjApbJGBoC-tR5W0-UnT2WF8rdu1yT1UUm4-o="
            alt="404 Error"
            className="w-120 ml-4 rounded-md md:pl-0"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
