const express = require('express');
const router = express.Router();
const heartPackageController = require('../app/controllers/healthPackageController');

router.get("/", heartPackageController.getHealthPackagesByUser)


router.get("/admin/", heartPackageController.getAllHealthPackages)
router.get("/admin/detail/:id", heartPackageController.getHealthPackageById)
router.post("/admin/create", heartPackageController.createHealthPackage)
router.put("/admin/update/:id", heartPackageController.updateHealthPackage)
router.put("/admin/lockstatus/:id", heartPackageController.LockPackageStatus)
module.exports = router;