import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminNavSidebar from "../components/AdminNavSidebar";
import Header from "../components/Header";
import { getStaffById, updateStaff } from "../services/staffService";

function UpdateStaff() {
  const location = useLocation();
  const navigate = useNavigate();
  const staffId = location.state?.id;
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');


  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then((response) => response.json())
      .then((data) => setProvinces(data))
      .catch((error) => console.error('Error fetching provinces:', error));
  }, []);


  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((response) => response.json())
        .then((data) => setDistricts(data.districts || []))
        .catch((error) => console.error('Error fetching districts:', error));
      setDistricts([]);
      setWards([]);
      setSelectedDistrict('');
      setSelectedWard('');
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((response) => response.json())
        .then((data) => setWards(data.wards || []))
        .catch((error) => console.error('Error fetching wards:', error));
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDistrict]);

  
  useEffect(() => {
    if (staff?.address && provinces.length > 0) {
      const addressParts = staff.address.split(', ').map(part => part.trim());
      if (addressParts.length === 3) {
        const [wardName, districtName, provinceName] = addressParts;
        const province = provinces.find((p) => p.name === provinceName);
        if (province) {
          setSelectedProvince(province.code);
          fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
            .then((response) => response.json())
            .then((data) => {
              const district = data.districts.find((d) => d.name === districtName);
              if (district) {
                setSelectedDistrict(district.code);
                fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
                  .then((response) => response.json())
                  .then((data) => {
                    const ward = data.wards.find((w) => w.name === wardName);
                    if (ward) {
                      setSelectedWard(ward.code);
                    }
                  });
              }
            });
        }
      }
    }
  }, [staff, provinces]);

  
  useEffect(() => {
    const provinceName = provinces.find((p) => p.code === parseInt(selectedProvince))?.name || '';
    const districtName = districts.find((d) => d.code === parseInt(selectedDistrict))?.name || '';
    const wardName = wards.find((w) => w.code === parseInt(selectedWard))?.name || '';
    const address = [wardName, districtName, provinceName].filter(Boolean).join(', ');
    if (address) {
      setStaff((prev) => ({ ...prev, address }));
    }
  }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards]);

  useEffect(() => {
    if (!staffId) {
      console.warn(
        "Không tìm thấy ID nhân viên trong location state. Điều hướng về trang danh sách."
      );
      navigate("/admin/staffs");
      return;
    }

    async function fetchStaff() {
      try {
        setLoading(true);
        const data = await getStaffById(staffId);
        setStaff(data);
      } catch (error) {
        console.error("Lỗi khi tải nhân viên:", error);
        setError("Không tìm thấy thông tin nhân viên hoặc có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, [staffId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "gender") {
      setStaff({
        ...staff,
        [name]: value === "true",
      });
    } else {
      setStaff({
        ...staff,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);
    try {
      await updateStaff(staffId, staff);
      setNotification("Đã cập nhật thông tin cá nhân thành công!");
      setTimeout(() => setNotification(null), 2000);
      setTimeout(() => navigate("/admin/staffs"), 2000);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      const errorMessage =
        error.response?.data?.message || "Cập nhật thất bại!";
      setNotification(errorMessage);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#F3F6F9] min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center py-15 text-xl text-gray-600">
            Đang tải thông tin...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-[#F3F6F9] min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center py-15 text-xl text-red-500">{error}</div>
          <button
            onClick={() => navigate("/admin/staffs")}
            className="mt-5 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-12 py-4"
          >
            Quay về danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!staff) {
    return null;
  }

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        <div className="flex">
          <div className="w-full max-w-6xl mx-auto p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-5">
              <h2 className="text-[#212B36] font-bold text-4xl leading-7">
                Cập nhật thông tin nhân viên
              </h2>
            </div>

            {/* Success Notification */}
            {notification && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-5 py-4 rounded-lg mb-8 text-center">
                {notification}
              </div>
            )}

            <div className="bg-white rounded-lg border border-[#D9D9D9] p-8">
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-15 gap-y-8"
              >
                {/* Họ và tên */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm text-gray-700 mb-2"
                  >
                    Họ và tên
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={staff.fullName || ""}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={staff.email || ""}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                {/* Số điện thoại */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm text-gray-700 mb-2"
                  >
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={staff.phone || ""}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                {/* CMND/CCCD */}
                <div>
                  <label
                    htmlFor="cidNumber"
                    className="block text-sm text-gray-700 mb-2"
                  >
                    CMND/CCCD
                  </label>
                  <input
                    id="cidNumber"
                    name="cidNumber"
                    type="text"
                    value={staff.cidNumber || ""}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                {/* Ngày sinh */}
                <div>
                  <label
                    htmlFor="dob"
                    className="block text-sm text-gray-700 mb-2"
                  >
                    Ngày sinh
                  </label>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    value={
                      staff.dob
                        ? new Date(staff.dob).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                {/* Địa chỉ */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="">Tỉnh/Thành phố</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      disabled={!selectedProvince}
                    >
                      <option value="">Quận/Huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      disabled={!selectedDistrict}
                    >
                      <option value="">Phường/Xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Vai trò */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm text-gray-700 mb-2"
                  >
                    Vai trò
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={staff.role || ""}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="receptionist">Lễ tân</option>
                    <option value="doctor">Bác sĩ</option>
                    <option value="technician">Kỹ thuật viên</option>
                  </select>
                </div>
                {/* Giới tính */}
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm text-gray-700 mb-2"
                  >
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={staff.gender === true ? "true" : "false"}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>

                {/* Các nút */}
                <div className="col-span-full flex justify-center space-x-4 mt-10">
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold text-lg rounded-lg px-15 py-4"
                  >
                    Cập nhật
                  </button>
                  <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-15 py-4"
                    onClick={() => navigate("/admin/staffs")}
                  >
                    Quay về danh sách
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateStaff;