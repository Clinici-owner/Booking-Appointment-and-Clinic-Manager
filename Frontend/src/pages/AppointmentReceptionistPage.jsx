import { useEffect, useMemo, useState } from 'react'

import AppointmentFilter from '../components/AppointmentFilter'
import AppointmentManageCard from '../components/AppointmentManageCard'

import appointmentService from '../services/appointmentService'

import { toast, Toaster } from 'sonner'

function AppointmentReceptionistPage() {
  const [appointments, setAppointments] = useState([])
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getAppointments()
        const sortedData = [...data].sort((a, b) => new Date(b.time) - new Date(a.time))
        setAppointments(sortedData)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }

    fetchAppointments()
  }, [])

  const handleConfirm = async (appointmentId) => {
    try {
      await appointmentService.confirmAppointment(appointmentId)
      const updatedAppointments = appointments.map((appt) =>
        appt._id === appointmentId ? { ...appt, status: 'confirmed' } : appt
      )
      setAppointments(updatedAppointments)

      toast.success("Đã xác nhận bệnh nhân tới khám")
    } catch (error) {
      console.error("Lỗi xác nhận lịch hẹn:", error)
      toast.error("Xác nhận thất bại")
    }
  }

  const filteredAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return []

    return appointments.filter((appointment) => {
      const matchStatus = !statusFilter || appointment.status === statusFilter
      const matchDate =
        !dateFilter ||
        new Date(appointment.time).toISOString().split("T")[0] === dateFilter

      const matchSearch = (() => {
        if (!searchTerm) return true

        const keyword = searchTerm.toLowerCase()

        const patientName = appointment.patientId?.fullName?.toLowerCase() || ""
        const doctorName = appointment.doctorId?.fullName?.toLowerCase() || ""
        const specialtyName =
          appointment.specialties?.[0]?.specialtyName?.toLowerCase() || ""
        const cidNumber = appointment.patientId?.cidNumber?.toLowerCase() || ""

        return (
          patientName.includes(keyword) ||
          doctorName.includes(keyword) ||
          specialtyName.includes(keyword) ||
          cidNumber.includes(keyword)
        )
      })()

      return matchStatus && matchDate && matchSearch
    })
  }, [appointments, statusFilter, dateFilter, searchTerm])

  const handleClearFilters = () => {
    setStatusFilter("")
    setDateFilter("")
    setSearchTerm("")
  }

  const handleAppointmentClick = (appointment) => {
    console.log("Clicked appointment:", appointment)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" richColors />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tiếp nhận bệnh nhân</h1>
        <p className="text-gray-600">
          Tổng cộng: {filteredAppointments.length} lịch hẹn
          {filteredAppointments.length !== appointments.length && ` (từ ${appointments.length} lịch hẹn)`}
        </p>
      </div>

      <AppointmentFilter
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        searchTerm={searchTerm}
        onStatusChange={setStatusFilter}
        onDateChange={setDateFilter}
        onSearchChange={setSearchTerm}
        onClearFilters={handleClearFilters}
      />

      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="relative">
              <AppointmentManageCard
                appointment={{
                  ...appointment,
                  hideStatus: appointment.status !== 'confirmed'
                }}
                onClick={handleAppointmentClick}
              />
              {appointment.status !== 'confirmed' && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => handleConfirm(appointment._id)}
                    className="px-4 py-1.5 rounded-full border border-blue-300 bg-blue-400 text-white text-sm font-semibold hover:bg-blue-500 transition"
                  >
                    Xác nhận đã tới khám
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lịch hẹn</h3>
              <p className="text-gray-500 mb-4">Không có lịch hẹn nào phù hợp với bộ lọc hiện tại.</p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentReceptionistPage
