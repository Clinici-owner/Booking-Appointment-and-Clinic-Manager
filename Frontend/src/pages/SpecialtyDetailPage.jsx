import React, { useEffect, useState } from "react";

import { getSpecialtyById } from "../services/specialtyService";
import { lockSpecialty } from "../services/specialtyService";

import { Link, useParams } from "react-router-dom";

import ConfirmationModal from "../components/ConfirmationModal";

import { Toaster, toast } from "sonner";

function SpecialtyDetailPage() {
  const { id } = useParams();
  const [specialty, setSpecialty] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    const fetchSpecialty = async () => {
      const data = await getSpecialtyById(id);
      setSpecialty(data);
    };
    fetchSpecialty();
  }, [id]);

  if (!specialty) {
    return <div>Loading...</div>;
  }

  const handleToggleLockStatusClick = () => {
    setActionType(specialty.status === false ? "lock" : "unlock");
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = async () => {
    try {
      await lockSpecialty(id, actionType === "lock" ? true : false);
      setShowConfirmModal(false);
      const data = await getSpecialtyById(id);
      setSpecialty(data);
      toast.success("Thay đổi trạng thái chuyên khoa thành công");
    } catch (error) {
      console.error("Error toggling lock status:", error);
    }
  };

  const handleCancelToggle = () => {
    setShowConfirmModal(false); // Ẩn modal
  };

  return (
    <div className="container">
      <Toaster position="top-right" richColors />
      <h1
        className={`text-3xl font-bold mb-4 ${
          specialty.status === false ? "text-custom-red" : "text-custom-blue"
        }`}
      >
        Khoa {specialty.specialtyName} {specialty.status === false ? "(Đã đóng)" : ""}
      </h1>

      <div className="flex flex-col md:flex-row items-start justify-between p-4 gap-8">
        {/* Cột trái: Thông tin chuyên khoa */}
        <div className="w-full md:w-2/3">
          <div className="mb-4">
            <p
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: specialty.descspecialty }}
            ></p>
          </div>
          {specialty.documentId.map((doc) => (
            <div key={doc._id} className="mb-4">
              <img
                src={doc.file_path}
                alt={specialty.specialtyName}
                className="w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Cột phải: Bác sĩ trưởng khoa */}
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2 text-custom-blue">
              Bác sĩ trưởng khoa
            </h3>
            <img
              src="https://thiennhanhospital.com/wp-content/uploads/2023/02/Avatar-2.png"
              alt=""
              className=" rounded-lg mb-4"
            />
            <p className="text-gray-700 mb-2">Bác sĩ trưởng khoa</p>
            <p className="mb-4 font-bold">Nguyễn Kim Cúc</p>
          </div>
          <div className="flex flex-col gap-4 mt-6 justify-center items-center">
            <button>
              <Link
                to={`/admin/specialties/update/${id}`}
                className="bg-custom-blue text-white px-4 py-2 rounded-lg hover:bg-custom-bluehover2 transition"
              >
                Chỉnh sửa chuyên khoa
              </Link>
            </button>
            <button className="" onClick={() => handleToggleLockStatusClick()}>
              {specialty.status === false ? (
                <p className="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition w-50">
                  {" "}
                  Mở lại chuyên khoa{" "}
                </p>
              ) : (
                <p className="bg-custom-red text-white px-4 py-2 rounded-lg hover:bg-red-500 transition w-50">
                  {" "}
                  Đóng chuyên khoa{" "}
                </p>
              )}
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmationModal
          title={
            actionType === "lock"
              ? "Xác nhận mở chuyên khoa"
              : "Xác nhận đóng chuyên khoa"
          }
          message={
            actionType === "lock" ? (
              <>
                Bạn có chắc chắn muốn mở chuyên khoa{" "}
                <strong>{specialty.specialtyName}</strong> này không?
              </>
            ) : (
              <>
                Bạn có chắc chắn muốn đóng chuyên khoa{" "}
                <strong>{specialty.specialtyName}</strong> này không?
              </>
            )
          }
          onConfirm={handleConfirmToggle}
          onCancel={handleCancelToggle}
        />
      )}
    </div>
  );
}

export default SpecialtyDetailPage;
