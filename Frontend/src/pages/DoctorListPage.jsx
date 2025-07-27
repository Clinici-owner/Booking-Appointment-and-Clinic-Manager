/**  DoctorListPage.jsx  **/
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorService } from "../services/doctorService";

const DoctorListPage = () => {
  /* ---------- State ---------- */
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const navigate = useNavigate();

  /* ---------- Fetch doctors ---------- */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await DoctorService.getAllDoctors();
        if (!res.success || !res.doctors)
          throw new Error("Failed to load doctors");
        setDoctors(res.doctors);
        setFilteredDoctors(res.doctors);
        setSpecialties(extractSpecialties(res.doctors));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  /* ---------- Helpers ---------- */
  const extractSpecialties = (list) => {
    const map = new Map();
    list.forEach((d) =>
      d.profile?.specialties?.forEach((s) => {
        if (s?._id && !map.has(s._id)) map.set(s._id, s.specialtyName);
      })
    );
    return [...map.entries()].map(([id, name]) => ({ _id: id, name }));
  };

  /* ---------- Filter when select ---------- */
  useEffect(() => {
    if (selectedSpecialty === "all") setFilteredDoctors(doctors);
    else
      setFilteredDoctors(
        doctors.filter((d) =>
          d.profile?.specialties?.some((s) => s._id === selectedSpecialty)
        )
      );
  }, [selectedSpecialty, doctors]);

  const goDetail = (id) => navigate(`/doctors/${id}`);

  /* ---------- Loading & Error ---------- */
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500" />
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-center">
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-red-600">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Reload
          </button>
        </div>
      </div>
    );

  /* ---------- MAIN UI ---------- */
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">ĐỘI NGŨ BÁC SĨ</h1>

      {/* === FILTER === */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-1/3">
          <label
            htmlFor="specialty"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Chọn chuyên khoa
          </label>
          <select
            id="specialty"
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {specialties.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-500">
          Đang hiển thị {filteredDoctors.length}/{doctors.length} bác sĩ
        </p>
      </div>

      {/* === GRID === */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDoctors.map((d) => (
          <article
            key={d._id}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
            onClick={() => goDetail(d._id)}
          >
            {/* ---------- IMAGE (65%) ---------- */}
            <div className="relative h-72 w-full overflow-hidden">
              <img
                src={d.avatar || "/default-avatar.jpg"}
                alt={d.fullName}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-90"
              />

              {/* ---------- OVERLAY (hover) ---------- */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 px-4 text-center opacity-0 transition duration-300 group-hover:opacity-100">
                <p className="mb-2 text-lg font-semibold text-white">
                  {d.profile?.yearsOfExperience || 0} Năm Kinh Nghiệm
                </p>
                <p className="mb-4 line-clamp-3 text-sm text-gray-100">
                  <span dangerouslySetInnerHTML={{ __html: d.profile?.description }} />
                </p>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    goDetail(d._id);
                  }}
                >
                  Xem Hồ Sơ 
                </button>
              </div>
            </div>

            {/* ---------- INFO (35%) ---------- */}
            <div className="flex flex-grow flex-col items-center justify-center gap-1 px-6 py-6 text-center">
              {/* Degree/title */}
              <span className="text-sm font-medium text-gray-600">
                {d.profile?.degree || "BS."}
              </span>

              {/* NAME */}
              <h3 className="text-lg font-extrabold uppercase tracking-wide text-blue-900">
                {d.fullName}
              </h3>

              {/* Specialty short */}
              <span className="text-sm text-gray-500">
                {d.profile?.specialties?.[0]?.specialtyName ||
                  "Chuyên khoa chưa cập nhật"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default DoctorListPage;
