import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getScheduleById, updateSchedule } from "../services/scheduleService";
import { Toaster, toast } from 'sonner';
import { listService } from '../services/medicalService'; // Import listService

function ScheduleUpdatePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const scheduleId = location.state?.id;
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [paraclinicalServices, setParaclinicalServices] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false); // Thêm state loading cho users
    const [isLoadingServices, setIsLoadingServices] = useState(false); // Thêm state loading cho services


    // Fetch users and paraclinical services
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingUsers(true);
            try {
                const usersResponse = await fetch('http://localhost:3000/api/staff');
                if (!usersResponse.ok) throw new Error('Failed to fetch staff');
                const usersData = await usersResponse.json();
                if (!Array.isArray(usersData)) throw new Error('Dữ liệu nhân viên không hợp lệ.');
                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching staff:', error);
                setError('Không thể tải danh sách nhân viên. Vui lòng thử lại sau.');
                toast.error('Không thể tải danh sách nhân viên.', { style: { background: '#EF4444', color: '#fff' } });
            } finally {
                setIsLoadingUsers(false);
            }

            setIsLoadingServices(true);
            try {
                const data = await listService(); // Sử dụng listService đã import
                const services = data.services || data;
                if (!Array.isArray(services)) throw new Error('Dữ liệu dịch vụ cận lâm sàng không hợp lệ.');
                setParaclinicalServices(services);
            } catch (error) {
                console.error('Error fetching paraclinical services:', error);
                setError('Không thể tải danh sách dịch vụ cận lâm sàng. Vui lòng thử lại sau.');
                toast.error('Không thể tải danh sách dịch vụ cận lâm sàng.', { style: { background: '#EF4444', color: '#fff' } });
            } finally {
                setIsLoadingServices(false);
            }
        };
        fetchData();
    }, []);

    // Fetch schedule data
    useEffect(() => {
        if (!scheduleId) {
            console.warn("Không tìm thấy ID lịch trình trong location state. Điều hướng về trang danh sách.");
            navigate("/admin/schedules");
            return;
        }

        async function fetchSchedule() {
            try {
                setLoading(true);
                const data = await getScheduleById(scheduleId);
                setSchedule({
                    ...data,
                    // Đảm bảo startTime và endTime có định dạng phù hợp cho input type="datetime-local"
                    startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '',
                    endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '',
                    // Đảm bảo userId và paraclinicalId là chuỗi ID
                    userId: data.userId?._id || '',
                    paraclinicalId: data.paraclinicalId?._id || ''
                });
            } catch (error) {
                console.error("Lỗi khi tải lịch trình:", error);
                setError("Không tìm thấy thông tin lịch trình hoặc có lỗi xảy ra.");
            } finally {
                setLoading(false);
            }
        }
        fetchSchedule();
    }, [scheduleId, navigate]);

    const validateField = (name, value) => {
        switch (name) {
            case 'userId':
                return value ? '' : 'Vui lòng chọn nhân viên.';
            case 'startTime':
                return value ? '' : 'Vui lòng chọn thời gian bắt đầu.';
            case 'endTime':
                if (!value) return 'Vui lòng chọn thời gian kết thúc.';
                if (schedule?.startTime && new Date(value) <= new Date(schedule.startTime)) {
                    return 'Thời gian kết thúc phải sau thời gian bắt đầu.';
                }
                return '';
            case 'roomNumber':
                if (!value) return 'Vui lòng nhập số phòng.';
                if (!/^[A-Za-z0-9-]+$/.test(value)) return 'Số phòng chỉ chứa chữ cái, số và dấu gạch ngang.';
                return '';
            case 'paraclinicalId':
                return value ? '' : 'Vui lòng chọn dịch vụ cận lâm sàng.';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSchedule(prev => {
            const updated = { ...prev, [name]: value };

            // Tự động điền roomNumber khi chọn dịch vụ cận lâm sàng
            if (name === 'paraclinicalId' && value) {
                const selectedService = paraclinicalServices.find(service => service._id === value);
                updated.roomNumber = selectedService?.roomNumber || '';
            }

            const errorMessage = validateField(name, updated[name]);
            setErrors(prevErrors => ({ ...prevErrors, [name]: errorMessage }));
            return updated;
        });
    };

    const isValidForm = () => {
        const newErrors = {};
        // Validate all fields required for the form
        const fieldsToValidate = ['userId', 'startTime', 'endTime', 'roomNumber', 'paraclinicalId'];
        fieldsToValidate.forEach(key => {
            const error = validateField(key, schedule[key]);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidForm()) {
            toast.error("Vui lòng kiểm tra lại các trường thông tin.", { style: { background: '#EF4444', color: '#fff' } });
            return;
        }

        try {
            const originalSchedule = await getScheduleById(scheduleId);
            const updatePayload = {};

            // So sánh từng trường và chỉ gửi những trường đã thay đổi
            // Đảm bảo so sánh đúng ID của object hoặc giá trị đã chuyển đổi
            if (schedule.userId !== (originalSchedule.userId?._id || originalSchedule.userId)) {
                updatePayload.userId = schedule.userId;
            }
            if (schedule.startTime !== (originalSchedule.startTime ? new Date(originalSchedule.startTime).toISOString().slice(0, 16) : '')) {
                updatePayload.startTime = schedule.startTime;
            }
            if (schedule.endTime !== (originalSchedule.endTime ? new Date(originalSchedule.endTime).toISOString().slice(0, 16) : '')) {
                updatePayload.endTime = schedule.endTime;
            }
            if (schedule.roomNumber !== originalSchedule.roomNumber) {
                updatePayload.roomNumber = schedule.roomNumber;
            }
            if (schedule.paraclinicalId !== (originalSchedule.paraclinicalId?._id || originalSchedule.paraclinicalId)) {
                updatePayload.paraclinicalId = schedule.paraclinicalId;
            }

            // Nếu không có gì thay đổi, hiển thị thông báo và không gọi API
            if (Object.keys(updatePayload).length === 0) {
                toast.info("Không có thông tin nào được thay đổi.", { style: { background: '#3B82F6', color: '#fff' } });
                setTimeout(() => navigate("/admin/schedules"), 1500);
                return;
            }

            await updateSchedule(scheduleId, updatePayload);
            toast.success("Đã cập nhật lịch trình thành công!", { style: { background: '#10B981', color: '#fff' } });
            setTimeout(() => navigate("/admin/schedules"), 2000);
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            const errorMessage = error.response?.data?.error || 'Cập nhật thất bại!';
            if (error.response?.status === 400) {
                toast.error(`Cập nhật thất bại: ${errorMessage}`, { style: { background: '#EF4444', color: '#fff' } });
            } else if (error.response?.status === 404) {
                toast.error(`Cập nhật thất bại: ${errorMessage}`, { style: { background: '#EF4444', color: '#fff' } });
            } else {
                toast.error(`Cập nhật thất bại: ${errorMessage}`, { style: { background: '#EF4444', color: '#fff' } });
            }
        }
    };

    if (loading || isLoadingUsers || isLoadingServices) {
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
                        onClick={() => navigate("/admin/schedules")}
                        className="mt-5 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-12 py-4"
                    >
                        Quay về danh sách
                    </button>
                </div>
            </div>
        );
    }

    if (!schedule) {
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
                                Cập nhật thông tin lịch trình
                            </h2>
                        </div>

                        <div className="bg-white rounded-lg border border-[#D9D9D9] p-6">
                            <form
                                onSubmit={handleSubmit}
                                className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6"
                            >
                                <div>
                                    <label
                                        htmlFor="userId"
                                        className="block text-sm text-gray-700 mb-1"
                                    >
                                        Nhân viên
                                    </label>
                                    <select
                                        id="userId"
                                        name="userId"
                                        value={schedule.userId}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    >
                                        <option value="">Chọn nhân viên</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>{user.fullName}</option>
                                        ))}
                                    </select>
                                    {errors.userId && <p className="text-sm text-red-600">{errors.userId}</p>}
                                </div>
                                <div>
                                    <label
                                        htmlFor="paraclinicalId"
                                        className="block text-sm text-gray-700 mb-1"
                                    >
                                        Dịch vụ cận lâm sàng
                                    </label>
                                    <select
                                        id="paraclinicalId"
                                        name="paraclinicalId"
                                        value={schedule.paraclinicalId}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    >
                                        <option value="">Chọn dịch vụ</option>
                                        {paraclinicalServices.map(service => (
                                            <option key={service._id} value={service._id}>{service.paraclinalName}</option>
                                        ))}
                                    </select>
                                    {errors.paraclinicalId && <p className="text-sm text-red-600">{errors.paraclinicalId}</p>}
                                </div>
                                <div>
                                    <label
                                        htmlFor="startTime"
                                        className="block text-sm text-gray-700 mb-1"
                                    >
                                        Thời gian bắt đầu
                                    </label>
                                    <input
                                        id="startTime"
                                        name="startTime"
                                        type="datetime-local"
                                        value={schedule.startTime || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                    {errors.startTime && <p className="text-sm text-red-600">{errors.startTime}</p>}
                                </div>
                                <div>
                                    <label
                                        htmlFor="endTime"
                                        className="block text-sm text-gray-700 mb-1"
                                    >
                                        Thời gian kết thúc
                                    </label>
                                    <input
                                        id="endTime"
                                        name="endTime"
                                        type="datetime-local"
                                        value={schedule.endTime || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                    {errors.endTime && <p className="text-sm text-red-600">{errors.endTime}</p>}
                                </div>
                                <div>
                                    <label
                                        htmlFor="roomNumber"
                                        className="block text-sm text-gray-700 mb-1"
                                    >
                                        Số phòng
                                    </label>
                                    <input
                                        id="roomNumber"
                                        name="roomNumber"
                                        type="text"
                                        value={schedule.roomNumber || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        disabled // Make roomNumber disabled as it's auto-filled
                                    />
                                    {errors.roomNumber && <p className="text-sm text-red-600">{errors.roomNumber}</p>}
                                </div>
                                <div className="col-span-full flex justify-between items-center mt-8">
                                    <div className="flex space-x-4">
                                        <button
                                            type="submit"
                                            className="bg-custom-blue hover:bg-custom-bluehover2 text-white font-semibold text-sm rounded-lg w-28 h-12"
                                        >
                                            Cập nhật
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold text-sm rounded-lg w-36 h-12"
                                            onClick={() => navigate("/admin/schedules")}
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

export default ScheduleUpdatePage;