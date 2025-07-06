import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import AdminNavSidebar from '../components/AdminNavSidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import { listService } from '../services/medicalService';
import { deleteSchedule, getAllSchedules } from '../services/scheduleService';

function ScheduleListPage() {
    const [allSchedules, setAllSchedules] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [filterSpecialty, setFilterSpecialty] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [schedulesPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();

    // State cho ConfirmationModal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null); // Lưu ID của lịch trình cần xóa

    // Lấy lịch trình và chuyên khoa (logic mới)
    const fetchData = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const [schedules, specialtiesRes] = await Promise.all([
                getAllSchedules(),
                listService()
            ]);
            setAllSchedules(Array.isArray(schedules) ? schedules : (schedules.schedules || []));
            setSpecialties(Array.isArray(specialtiesRes) ? specialtiesRes : (specialtiesRes.specialties || []));
        } catch (error) {
            setFetchError(`Không thể tải dữ liệu. Lỗi: ${error.response?.data?.error || error.message}`);
            toast.error('Không thể tải dữ liệu danh sách lịch trình và chuyên khoa.', {
                classNames: {
                    error: 'bg-red-500 text-white',
                }
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearchChange = useCallback((e) => {
        setSearchName(e.target.value);
        setCurrentPage(1);
    }, []);

    // const handleFilterChange = useCallback((e) => {
    //     setFilterSpecialty(e.target.value);
    //     setCurrentPage(1);
    // }, []);


    // Hàm mở modal xác nhận xóa
    const confirmDelete = useCallback((scheduleId, event) => {
        event.stopPropagation(); // Ngăn chặn sự kiện click hàng (handleRowClick)
        setScheduleToDelete(scheduleId);
        setShowConfirmModal(true);
    }, []);

    // Hàm xử lý khi xác nhận xóa trên modal
    const handleConfirmDelete = useCallback(async () => {
        if (scheduleToDelete) {
            try {
                await deleteSchedule(scheduleToDelete);
                toast.success('Xóa lịch trình thành công!', {
                     style: { background: '#10B981', color: '#fff' },
                });
                fetchData(); 
            } catch (error) {
                console.error('Lỗi khi xóa lịch trình:', error);
                toast.error(`Lỗi khi xóa lịch trình: ${error.response?.data?.error || error.message}`, {
                    style: { background: '#EF4444', color: '#fff' },
                });
            } finally {
                setShowConfirmModal(false); // Ẩn modal sau khi xử lý
                setScheduleToDelete(null); // Đặt lại scheduleToDelete
            }
        }
    }, [scheduleToDelete, fetchData]);

    // Hàm xử lý khi hủy xóa trên modal
    const handleCancelDelete = useCallback(() => {
        setShowConfirmModal(false);
        setScheduleToDelete(null);
    }, []);

    const handleRowClick = useCallback((scheduleId) => {
        navigate('/admin/schedules/detail', { state: { id: scheduleId } });
    }, [navigate]);

    // Lọc theo chuyên khoa, tên bác sĩ (không sort)
    const processedSchedules = useMemo(() => {
    let filtered = allSchedules;

    // Tìm kiếm theo tên bác sĩ
    if (searchName) {
        filtered = filtered.filter(schedule =>
            schedule.userId?.fullName?.toLowerCase().includes(searchName.toLowerCase())
        );
    }

    // Lọc theo chuyên khoa
    if (filterSpecialty) {
        filtered = filtered.filter(schedule => {
            const specialty = specialties.find(spec => spec._id.toString() === schedule.specialties?.toString());
            return specialty?.specialtyName?.toLowerCase().includes(filterSpecialty.toLowerCase());
        });
    }

    return filtered;
}, [allSchedules, searchName, filterSpecialty, specialties]);

    const totalPages = Math.ceil(processedSchedules.length / schedulesPerPage);
    const indexOfLastSchedule = currentPage * schedulesPerPage;
    const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
    const currentSchedules = processedSchedules.slice(indexOfFirstSchedule, indexOfLastSchedule);

    // Danh sách chuyên khoa duy nhất
    // const uniqueSpecialties = useMemo(() => {
    //     const specialtyNames = specialties
    //         .filter(spec => spec && spec.specialtyName)
    //         .map(spec => spec.specialtyName);
    //     return [...new Set(specialtyNames)].sort();
    // }, [specialties]);

    const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

    if (fetchError) {
        return (
            <div className="flex min-h-screen">
                <Toaster
                    richColors
                    position="top-right"
                    classNames={{
                        success: 'bg-green-500 text-white', 
                        error: 'bg-red-500 text-white',
                    }}
                />
                <AdminNavSidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center py-15 text-xl text-red-500">{fetchError}</div>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="mt-5 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-12 py-4"
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <Toaster
                    richColors
                    position="top-right"
                    classNames={{
                        success: 'bg-green-500 text-white', // Đã thêm màu xanh lá cho success
                        error: 'bg-red-500 text-white',
                    }}
                />
                <AdminNavSidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center py-15 text-xl text-gray-600">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Toaster />
            <div className="flex-1 flex flex-col">
                <div className="w-full max-w-6xl mx-auto p-6 relative">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                        <h2 className="text-[#212B36] font-bold text-4xl leading-8">
                            Danh Sách Lịch Trình
                        </h2>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex items-center bg-white rounded-lg border border-[#D9D9D9] w-full md:w-[520px] px-6 py-4 text-[#637381] text-base leading-6">
                            <i className="fas fa-search text-[#637381] mr-3 text-lg"></i>
                            <input
                                className="w-full text-base placeholder:text-[#637381] focus:outline-none bg-transparent"
                                placeholder="Tìm kiếm theo tên nhân viên..."
                                type="text"
                                value={searchName}
                                onChange={handleSearchChange}
                            />
                        </div>
                        {/* <select
                            aria-label="Filter specialties"
                            className="bg-white border border-[#D9D9D9] rounded-lg text-base font-semibold text-[#212B36] py-4 px-6 w-full md:w-[250px] cursor-pointer"
                            value={filterSpecialty}
                            onChange={handleFilterChange}
                        >
                            <option value="">Tất cả chuyên khoa</option>
                            {uniqueSpecialties.map(specialtyName => (
                                <option key={specialtyName} value={specialtyName}>{specialtyName}</option>
                            ))}
                        </select> */}
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-[#D9D9D9] bg-white">
                        <table className="w-full text-base text-[#212B36] border-collapse rounded-lg table-fixed">
                            <thead>
                                <tr className="border-b border-[#D9D9D9]">
                                    <th className="text-left font-semibold py-5 px-6 w-[5%]">STT</th>
                                    <th className="text-left font-semibold py-5 px-6 w-[18%]">Bác sĩ</th>
                                    <th className="text-left font-semibold py-5 px-6 w-[12%]">Phòng</th>
                                    <th className="text-left font-semibold py-5 px-6 w-[12%]">Ngày</th>
                                    <th className="text-left font-semibold py-5 px-6 w-[12%]">Ca làm</th>
                                    <th className="text-center font-semibold py-5 px-6 w-[10%]">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentSchedules.length > 0 ? (
                                    currentSchedules.map((schedule, index) => {
                                        // Lấy chuyên khoa
                                        const doctorFullName = schedule.userId?.fullName || '-';
                                        const roomNumber = schedule.room?.roomNumber || '-';
                                        const dateStr = schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : '-';
                                        let shiftStr = '-';
                                        switch (schedule.shift) {
                                            case 'MORNING': shiftStr = 'Sáng'; break;
                                            case 'AFTERNOON': shiftStr = 'Chiều'; break;
                                            case 'EVENING': shiftStr = 'Tối'; break;
                                            default: shiftStr = '-';
                                        }
                                         return (
                                            <tr key={schedule._id} className="border-t border-[#D9D9D9] cursor-pointer hover:bg-gray-50">
                                                <td className="py-6 px-6 font-normal w-[5%]" onClick={() => handleRowClick(schedule._id)}>
                                                    {indexOfFirstSchedule + index + 1}
                                                </td>
                                                <td className="py-6 px-6 w-[18%]" onClick={() => handleRowClick(schedule._id)}>
                                                    {doctorFullName}
                                                </td>
                                                <td className="py-6 px-6 w-[12%]" onClick={() => handleRowClick(schedule._id)}>
                                                    {roomNumber}
                                                </td>
                                                <td className="py-6 px-6 w-[12%]" onClick={() => handleRowClick(schedule._id)}>
                                                    {dateStr}
                                                </td>
                                                <td className="py-6 px-6 w-[12%]" onClick={() => handleRowClick(schedule._id)}>
                                                    {shiftStr}
                                                </td>
                                                <td className="py-6 px-6 text-center w-[10%]">
                                                    <button onClick={(event) => confirmDelete(schedule._id, event)} className="text-red-600 hover:text-red-800 text-lg">
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-6 text-center text-lg text-gray-500">
                                            Không tìm thấy lịch trình phù hợp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end items-center gap-4 mt-7 text-[#637381] text-base font-semibold">
                        <button
                            aria-label="Previous page"
                            className="w-11 h-9 border border-[#D9D9D9] rounded-md flex items-center justify-center hover:bg-[#E6F4F1] transition-colors"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`w-11 h-9 border border-[#D9D9D9] rounded-md flex items-center justify-center hover:bg-[#E6F4F1] transition-colors ${currentPage === i + 1 ? 'bg-[#E6F4F1] text-[#00BFA6]' : ''}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            aria-label="Next page"
                            className="w-11 h-9 border border-[#D9D9D9] rounded-md flex items-center justify-center hover:bg-[#E6F4F1] transition-colors"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <button
                        className="fixed bottom-18 right-10 bg-custom-blue text-white text-base font-semibold rounded-lg py-3 px-6 hover:bg-custom-bluehover2 transition-colors z-50"
                        type="button"
                        onClick={() => navigate('/admin/schedules/add')}
                    >
                        Xem bảng lịch trình
                    </button>
                </div>
            </div>
            <Toaster
                richColors
                position="top-right"
                classNames={{
                    success: 'bg-green-500 text-white',
                    error: 'bg-red-500 text-white',
                }}
            />

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <ConfirmationModal
                    title="Xác nhận xóa lịch trình"
                    message="Bạn có chắc chắn muốn xóa lịch trình này? Thao tác này không thể hoàn tác."
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
}

export default ScheduleListPage;