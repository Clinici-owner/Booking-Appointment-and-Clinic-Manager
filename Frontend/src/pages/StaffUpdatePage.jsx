import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStaffById, updateStaff } from "../services/staffService";
import { Toaster, toast } from 'sonner';

// updateStaff function to handle staff updates
function UpdateStaff() {
  const location = useLocation();
  const navigate = useNavigate();
  const staffId = location.state?.id;
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch provinces');
        return response.json();
      })
      .then((data) => setProvinces(data))
      .catch((error) => {
        console.error('Error fetching provinces:', error);
        setError('Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau.');
      });
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict('');
      setSelectedWard('');
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((response) => {
          if (!response.ok) throw new Error('Failed to fetch districts');
          return response.json();
        })
        .then((data) => setDistricts(data.districts || []))
        .catch((error) => {
          console.error('Error fetching districts:', error);
          setError('Không thể tải danh sách quận/huyện. Vui lòng kiểm tra kết nối.');
        });
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      setWards([]);
      setSelectedWard('');
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((response) => {
          if (!response.ok) throw new Error('Failed to fetch wards');
          return response.json();
        })
        .then((data) => setWards(data.wards || []))
        .catch((error) => {
          console.error('Error fetching wards:', error);
          setError('Không thể tải danh sách phường/xã. Vui lòng kiểm tra kết nối.');
        });
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (staff?.address && provinces.length > 0) {
      const addressParts = staff.address.split(', ').map(part => part.trim());
      if (addressParts.length >= 3) {
        const provinceName = addressParts[addressParts.length - 1];
        const districtName = addressParts[addressParts.length - 2];
        const wardName = addressParts[addressParts.length - 3];
        const specificAddress = addressParts.slice(0, addressParts.length - 3).join(', ') || '';
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedWard('');
        setStaff((prev) => ({ ...prev, specificAddress }));
        const province = provinces.find((p) => p.name === provinceName);
        if (province) {
          setSelectedProvince(province.code);
          fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
            .then((response) => {
              if (!response.ok) throw new Error('Failed to fetch districts for address');
              return response.json();
            })
            .then((data) => {
              const district = data.districts.find((d) => d.name === districtName);
              if (district) {
                setSelectedDistrict(district.code);
                fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
                  .then((response) => {
                    if (!response.ok) throw new Error('Failed to fetch wards for address');
                    return response.json();
                  })
                  .then((data) => {
                    const ward = data.wards.find((w) => w.name === wardName);
                    if (ward) {
                      setSelectedWard(ward.code);
                    }
                  })
                  .catch((error) => console.error('Error fetching wards for address:', error));
              }
            })
            .catch((error) => console.error('Error fetching districts for address:', error));
        }
      }
    }
  }, [staff?.address, provinces]);

  useEffect(() => {
    if (!staffId) {
      console.warn("Không tìm thấy ID nhân viên trong location state. Điều hướng về trang danh sách.");
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

  const validateField = (name, value) => {
    const nameRegex = /^[\p{L}\s]+$/u;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{0,11}$/;
    const cidRegex = /^\d{0,12}$/;
    const specificAddressRegex = /^[\p{L}\d\s,.-]+$/u;

    switch (name) {
      case 'fullName':
        if (value.length > 50 || !nameRegex.test(value)) {
          return 'Họ tên không hợp lệ. Chỉ được chứa chữ cái, không quá 50 ký tự.';
        }
        break;
      case 'email':
        if (!emailRegex.test(value)) {
          return 'Email không hợp lệ.';
        }
        break;
      case 'phone':
        if (!phoneRegex.test(value)) {
          return 'Số điện thoại không hợp lệ. Tối đa 11 chữ số.';
        }
        break;
      case 'cidNumber':
        if (!cidRegex.test(value)) {
          return 'CMND/CCCD không hợp lệ. Tối đa 12 chữ số.';
        }
        break;
      case 'specificAddress':
        if (value && !specificAddressRegex.test(value)) {
          return 'Địa chỉ cụ thể không hợp lệ. Chỉ được chứa chữ cái, số, dấu phẩy, dấu chấm và dấu gạch ngang.';
        }
        if (value.length > 100) {
          return 'Địa chỉ cụ thể không được vượt quá 100 ký tự.';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStaff((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : name === "gender" ? value === "true" : value,
      };
      const errorMessage = validateField(name, updated[name]);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
      return updated;
    });
  };

  const buildAddress = () => {
    const provinceName = provinces.find((p) => p.code === parseInt(selectedProvince))?.name || '';
    const districtName = districts.find((d) => d.code === parseInt(selectedDistrict))?.name || '';
    const wardName = wards.find((w) => w.code === parseInt(selectedWard))?.name || '';
    const addressParts = [staff?.specificAddress, wardName, districtName, provinceName].filter(Boolean);
    return addressParts.join(', ');
  };

  const isValidForm = () => {
    const newErrors = {};
    Object.keys(staff).forEach((key) => {
      const error = validateField(key, staff[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidForm()) {
      toast.error("Vui lòng kiểm tra lại các trường thông tin.");
      return;
    }

    const fullAddress = buildAddress();
    const updatedStaff = { ...staff, address: fullAddress };

    try {
      const originalStaff = await getStaffById(staffId);

      const updatePayload = {};
      if (updatedStaff.email !== originalStaff.email) updatePayload.email = updatedStaff.email;
      if (updatedStaff.phone !== originalStaff.phone) updatePayload.phone = updatedStaff.phone;
      if (updatedStaff.cidNumber !== originalStaff.cidNumber) updatePayload.cidNumber = updatedStaff.cidNumber;
      if (updatedStaff.fullName !== originalStaff.fullName) updatePayload.fullName = updatedStaff.fullName;
      if (updatedStaff.role !== originalStaff.role) updatePayload.role = updatedStaff.role;
      if (updatedStaff.dob !== originalStaff.dob) updatePayload.dob = updatedStaff.dob;
      if (updatedStaff.gender !== originalStaff.gender) updatePayload.gender = updatedStaff.gender;
      if (fullAddress !== originalStaff.address) updatePayload.address = fullAddress;

      await updateStaff(staffId, updatePayload);
      toast.success("Đã cập nhật thông tin cá nhân thành công!");
      setTimeout(() => navigate("/admin/staffs"), 2000);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      let errorMessage = "Cập nhật thất bại!";
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message.toLowerCase();
        if (backendMessage.includes("email")) {
          errorMessage = "Email đã tồn tại trong hệ thống.";
        } else if (backendMessage.includes("phone")) {
          errorMessage = "Số điện thoại đã tồn tại trong hệ thống.";
        } else if (backendMessage.includes("cidnumber") || backendMessage.includes("cccd")) {
          errorMessage = "CMND/CCCD đã tồn tại trong hệ thống.";
        } else {
          errorMessage = error.response.data.message;
        }
      }
      toast.error(errorMessage);
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
    <div className="flex text-[18px] leading-[1.75]">
      <Toaster />
      <div className="flex-1 flex flex-col">
        <div className="flex">
          <div className="w-full max-w-[1600px] mx-auto p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-[#212B36] font-bold text-4xl leading-6">
                Cập nhật thông tin nhân viên
              </h2>
            </div>

            <div className="bg-white rounded-lg border border-[#D9D9D9] p-6">
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6"
              >
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm text-gray-700 mb-1"
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
                  {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-gray-700 mb-1"
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
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm text-gray-700 mb-1"
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
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>
                <div>
                  <label
                    htmlFor="cidNumber"
                    className="block text-sm text-gray-700 mb-1"
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
                  {errors.cidNumber && <p className="text-sm text-red-600">{errors.cidNumber}</p>}
                </div>
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm text-gray-700 mb-1"
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
                <div>
                  <label
                    htmlFor="dob"
                    className="block text-sm text-gray-700 mb-1"
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
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <div className="grid grid-cols-1 gap-4">
                    {errors.specificAddress && <p className="text-sm text-red-600">{errors.specificAddress}</p>}
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
                    <input
                      id="specificAddress"
                      name="specificAddress"
                      type="text"
                      placeholder="Địa chỉ cụ thể (số nhà, đường)"
                      value={staff.specificAddress || ""}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm text-gray-700 mb-1"
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
                <div className="col-span-full flex justify-between items-center mt-8">
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold text-sm rounded-lg w-28 h-12"
                    >
                      Cập nhật
                    </button>
                    <button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white font-semibold text-sm rounded-lg w-36 h-12"
                      onClick={() => navigate("/admin/staffs")}
                    >
                      Quay về danh sách
                    </button>
                  </div>
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