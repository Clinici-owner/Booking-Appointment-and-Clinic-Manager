import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MedicalProcessService } from '../services/medicalProcessService';
import { MedicalHistoryService } from '../services/medicalHistoryService';

const MedicalProcessDetailPage = () => {
    const { state } = useLocation();
    const id = state?.process?._id;
    const navigate = useNavigate();
    const [process, setProcess] = useState(null);
    const [finalResultInput, setFinalResultInput] = useState("");
    const [isSavingFinalResult, setIsSavingFinalResult] = useState(false);
    const [finalResultError, setFinalResultError] = useState(null);
    // Nếu process đã có finalResult thì hiển thị luôn
    useEffect(() => {
        if (process && process.finalResult) {
            setFinalResultInput(process.finalResult);
        }
    }, [process]);
    const [medicalHistories, setMedicalHistories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch medical process details
    useEffect(() => {
        const fetchProcess = async () => {
            try {
                setIsLoading(true);
                const [data, histories] = await Promise.all([
                    MedicalProcessService.getMedicalProcessById(id),
                    MedicalHistoryService.getAllMedicalHistories()
                ]);
                setProcess(data);
                setMedicalHistories(histories);
            } catch (err) {
                console.error('Error fetching medical process:', err);
                setError('Không thể tải chi tiết tiến trình khám');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProcess();
    }, [id]);

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Get status color and text
    const getStatusInfo = (status) => {
        switch (status) {
            case 'completed':
                return { color: 'bg-green-100 text-green-800', text: 'Hoàn thành' };
            case 'in_progress':
                return { color: 'bg-blue-100 text-blue-800', text: 'Đang thực hiện' };
            case 'pending':
                return { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' };
            case 'cancelled':
                return { color: 'bg-red-100 text-red-800', text: 'Đã hủy' };
            default:
                return { color: 'bg-gray-100 text-gray-800', text: status };
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!process) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    Không tìm thấy tiến trình khám
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const statusInfo = getStatusInfo(process.status);

    // Kiểm tra tất cả các bước đã hoàn thành
    const allStepsCompleted = process.processSteps.every(step => step.isCompleted);


    // Hàm lưu finalResult
    const handleSaveFinalResult = async () => {
        setIsSavingFinalResult(true);
        setFinalResultError(null);
        try {
            await MedicalProcessService.updateMedicalProcessFinalResult(process._id, finalResultInput);
            setProcess({ ...process, finalResult: finalResultInput });
        } catch (err) {
            setFinalResultError(err.message || 'Có lỗi khi lưu kết quả cuối cùng');
        } finally {
            setIsSavingFinalResult(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
            </button>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Header Section */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800">Tiến Trình Khám Bệnh</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                        </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                        Tạo lúc: {formatDate(process.createdAt)}
                    </div>
                </div>

                {/* Patient and Doctor Info */}
                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Patient Info */}
                    <div className="border rounded-lg p-4">
                        <h2 className="text-lg font-medium text-gray-800 mb-3">Thông tin bệnh nhân</h2>
                        <div className="flex items-center">
                            <img
                                src={process.patientId.avatar}
                                alt={process.patientId.fullName}
                                className="w-16 h-16 rounded-full object-cover cursor-pointer"
                            />
                            <div className="ml-4">
                                <h3
                                    className="text-lg font-semibold text-gray-800 "
                                >
                                    {process.patientId.fullName}
                                </h3>
                                <p className="text-sm text-gray-600">{process.patientId.email}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Giới tính: {process.patientId.gender ? 'Nam' : 'Nữ'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="border rounded-lg p-4">
                        <h2 className="text-lg font-medium text-gray-800 mb-3">Thông tin bác sĩ</h2>
                        <div className="flex items-center">
                            <img
                                src={process.doctorId.avatar}
                                alt={process.doctorId.fullName}
                                className="w-16 h-16 rounded-full object-cover cursor-pointer"
                            />
                            <div className="ml-4">
                                <h3
                                    className="text-lg font-semibold text-gray-800"
                                >
                                    {process.doctorId.fullName}
                                </h3>
                                <p className="text-sm text-gray-600">{process.doctorId.email}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Số điện thoại: {process.doctorId.phone}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Steps */}
                <div className="px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Các bước thực hiện</h2>
                    <div className="space-y-4">
                        {process.processSteps.map((step, index) => {
                            // Tìm medicalHistory có processStep._id trùng với step._id
                            const relatedHistory = medicalHistories.find(h => h.processStep && h.processStep._id === step._id);
                            return (
                                <div
                                    key={step._id}
                                    className={`border rounded-lg p-4 ${step.isCompleted ? 'bg-green-50' : 'bg-white'} shadow-sm hover:shadow-md transition-shadow duration-200`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-800">
                                                Bước {index + 1}: {step.serviceId.paraclinalName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Phòng: {step.serviceId.room.roomNumber} - {step.serviceId.room.roomName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Giá: {step.serviceId.paraPrice.toLocaleString()} VND
                                            </p>
                                            {step.notes && (
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium text-gray-700">Ghi chú:</p>
                                                    <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">{step.notes}</p>
                                                </div>
                                            )}
                                            {/* Hiển thị kết quả nếu có */}
                                            {relatedHistory && relatedHistory.resultFiles && relatedHistory.resultFiles.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Kết quả:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {relatedHistory.resultFiles.map(file => (
                                                            <a
                                                                key={file._id}
                                                                href={file.file_path}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block"
                                                            >
                                                                <img
                                                                    src={file.file_path}
                                                                    alt="Kết quả xét nghiệm"
                                                                    className="w-32 h-32 object-cover rounded border hover:shadow-lg transition-shadow duration-200"
                                                                />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium 'bg-gray-100 text-gray-800'`}>
                                                {step.isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        Cập nhật lần cuối: {formatDate(step.updatedAt)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Final Result input nếu tất cả bước đã hoàn thành */}
                {allStepsCompleted && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Kết luận cuối cùng</label>
                            <textarea
                                className="w-full border rounded p-2 min-h-[80px]"
                                value={finalResultInput}
                                onChange={e => setFinalResultInput(e.target.value)}
                                disabled={!!process.finalResult || isSavingFinalResult}
                                placeholder="Nhập kết quả/kết luận cuối cùng..."
                            />
                            {finalResultError && <p className="text-red-600 mt-1 text-sm">{finalResultError}</p>}
                        </div>
                        {!process.finalResult && (
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                                onClick={handleSaveFinalResult}
                                disabled={isSavingFinalResult || !finalResultInput.trim()}
                            >
                                {isSavingFinalResult ? 'Đang lưu...' : 'Lưu kết quả cuối cùng'}
                            </button>
                        )}
                        {process.finalResult && (
                            <div className="text-green-700 font-medium mt-2">Đã lưu kết quả cuối cùng.</div>
                        )}
                    </div>
                )}
                {/* Process Metadata */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Cập nhật lần cuối:</p>
                            <p className="text-gray-800">{formatDate(process.updatedAt)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalProcessDetailPage;