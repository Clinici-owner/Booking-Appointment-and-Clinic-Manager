const userRouter = require('./user')
const staffRouter = require('./staff')
const authRouter = require('./auth')
const serviceRouter = require('./service')
const documentUploadRouter = require('./documentUpload')
const specialtiesRouter = require('./specialty')
const patientRouter = require('./patient')
const medicalHistoryRouter = require('./medicalHistory')
const doctorProfileRouter = require('./doctorProfile')
const medicalProcessRouter = require('./medicalProcess')
const testRouter = require('./test')
const healthPackageRouter = require('./healthPackage')
const newsRouter = require('./news');
const scheduleRouter = require('./schedule')
const bookingRouter = require('./booking');
function route(app) {
    app.use('/api/user', userRouter);
    app.use('/api/staff', staffRouter);
    app.use('/auth/google', authRouter);
    app.use('/api/service', serviceRouter);
    app.use('/api/documents', documentUploadRouter);
    app.use('/api/specialty', specialtiesRouter);
    app.use('/api/patient', patientRouter);
    app.use('/api/medicalHistory', medicalHistoryRouter);
    app.use('/api/doctorProfile', doctorProfileRouter);
    app.use('/api/medicalProcess', medicalProcessRouter);
    app.use('/api/test', testRouter);
    app.use('/api/healthPackage', healthPackageRouter);
    app.use('/api/news', newsRouter);
    app.use('/api/schedules', scheduleRouter);
    app.use('/api/booking', bookingRouter);
}

module.exports = route