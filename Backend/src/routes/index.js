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
const healthPackageRouter = require('./healthPackage')
const newsRouter = require('./news');
const scheduleRouter = require('./schedule')
const appointmentRouter = require('./appointment');
const notificationRouter = require('./notification');
const roomRouter = require('./room');
const payosRouter = require('./payos');
// const stepProcessRouter = require('./stepProcess');

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
    app.use('/api/healthPackage', healthPackageRouter);
    app.use('/api/news', newsRouter);
    app.use('/api/schedules', scheduleRouter);
    app.use('/api/appointments', appointmentRouter);
    app.use('/api/notifications', notificationRouter);
    app.use('/api/room', roomRouter);
    app.use('/api/payos', payosRouter);
    // app.use('/api/stepProcess', stepProcessRouter);
}

module.exports = route