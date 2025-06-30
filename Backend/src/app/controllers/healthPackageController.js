const HealthPackage = require('../models/HealthPackage');
const ParaclinicalService = require('../models/ParaclinicalService');
const User = require('../models/User');
class HealthPackageController {

    async getHealthPackagesByUser(req, res){
    try {
      const healthPackages = await HealthPackage.find({
        status: "active",
      })
        .populate("service")
        .populate("userId", "fullName email phone cidNumber")
        .sort({ createdAt: -1 })

      res.status(200).json({
        success: true,
        data: healthPackages,
        count: healthPackages.length,
        message: "Lấy danh sách gói khám thành công",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      })
    }
}
async getAllHealthPackages (req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query

      // Tạo filter
      const filter = {}
      if (status && ["active", "nonactive"].includes(status)) {
        filter.status = status
      }
      if (search) {
        filter.$or = [
          { packageName: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ]
      }

      const skip = (page - 1) * limit
      const total = await HealthPackage.countDocuments(filter)

      const healthPackages = await HealthPackage.find(filter)
        .populate("service", "serviceName servicePrice")
        .populate("userId", "fullName email phone role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit))

      res.status(200).json({
        success: true,
        data: healthPackages,
        pagination: {
          current: Number.parseInt(page),
          total: Math.ceil(total / limit),
          count: healthPackages.length,
          totalRecords: total,
        },
        message: "Lấy danh sách gói khám thành công",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      })
    }
  }

  // GET /api/admin/health-packages/:id - Lấy chi tiết gói khám
  async getHealthPackageById (req, res) {
    try {
      const { id } = req.params

      const healthPackage = await HealthPackage.findById(id)
        .populate("service", "serviceName servicePrice description")
        .populate("userId", "fullName email phone role")

      if (!healthPackage) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy gói khám",
        })
      }

      res.status(200).json({
        success: true,
        data: healthPackage,
        message: "Lấy thông tin gói khám thành công",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      })
    }
  }

  // POST /api/admin/health-packages - Tạo gói khám mới
  async createHealthPackage (req, res) {
    try {
      const { packageName, packagePrice, service, packageImage, description, userId } = req.body

      // Validation
      if (!packageName || !packagePrice || !service || !userId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc: packageName, packagePrice, service, userId",
        })
      }

      // Kiểm tra user tồn tại
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        })
      }

      // Kiểm tra tên gói khám đã tồn tại
      const existingPackage = await HealthPackage.findOne({ packageName })
      if (existingPackage) {
        return res.status(400).json({
          success: false,
          message: "Tên gói khám đã tồn tại",
        })
      }

      const newHealthPackage = new HealthPackage({
        packageName,
        packagePrice,
        service,
        packageImage: packageImage || "imageExample.jpg",
        description: description || "",
        userId,
        status: "active",
      })

      const savedPackage = await newHealthPackage.save()

      const populatedPackage = await HealthPackage.findById(savedPackage._id)
        .populate("service", "serviceName servicePrice")
        .populate("userId", "fullName email phone role")

      res.status(201).json({
        success: true,
        data: populatedPackage,
        message: "Tạo gói khám thành công",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      })
    }
  }

  async updateHealthPackage (req, res){
    try {
      const { id } = req.params
      const updateData = req.body

      // Kiểm tra gói khám tồn tại
      const existingPackage = await HealthPackage.findById(id)
      if (!existingPackage) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy gói khám",
        })
      }

      // Kiểm tra tên gói khám trùng lặp (nếu thay đổi tên)
      if (updateData.packageName && updateData.packageName !== existingPackage.packageName) {
        const duplicatePackage = await HealthPackage.findOne({
          packageName: updateData.packageName,
          _id: { $ne: id },
        })
        if (duplicatePackage) {
          return res.status(400).json({
            success: false,
            message: "Tên gói khám đã tồn tại",
          })
        }
      }

      // Kiểm tra userId nếu có thay đổi
      if (updateData.userId) {
        const user = await User.findById(updateData.userId)
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy người dùng",
          })
        }
      }

      const updatedPackage = await HealthPackage.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
        .populate("service", "serviceName servicePrice")
        .populate("userId", "fullName email phone role")

      res.status(200).json({
        success: true,
        data: updatedPackage,
        message: "Cập nhật gói khám thành công",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      })
    }
  }

  async LockPackageStatus (req, res) {
    try {
      const { id } = req.params

      const healthPackage = await HealthPackage.findById(id)
      if (!healthPackage) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy gói khám",
        })
      }

      // Toggle status
      const newStatus = healthPackage.status === "active" ? "nonactive" : "active"

      const updatedPackage = await HealthPackage.findByIdAndUpdate(
        id,
        { status: newStatus, updatedAt: new Date() },
        { new: true },
      )
        .populate("service", "serviceName servicePrice")
        .populate("userId", "fullName email phone role")

      const statusText = newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"

      res.status(200).json({
        success: true,
        data: updatedPackage,
        message: `${statusText.charAt(0).toUpperCase() + statusText.slice(1)} gói khám thành công`,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      })
    }
  }
}
module.exports = new HealthPackageController();
