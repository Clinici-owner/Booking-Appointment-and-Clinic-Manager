const userRouter = require('./user')
const staffRouter = require('./staff')
const authRouter = require('./auth')
const serviceRouter = require('./service')
const documentUploadRouter = require('./documentUpload')
const specialtiesRouter = require('./specialty')
const patientRouter = require('./patient')
const medicalHistoryRouter = require('./medicalHistory')
const testRouter = require('./test')
const newsRouter = require('./news');
function route(app) {
    app.use('/api/user', userRouter);
    app.use('/api/staff', staffRouter);
    app.use('/auth/google', authRouter);
    app.use('/api/service', serviceRouter);
    app.use('/api/documents', documentUploadRouter);
    app.use('/api/specialty', specialtiesRouter);
    app.use('/api/patient', patientRouter);
    app.use('/api/medicalHistory', medicalHistoryRouter);
    app.use('/api/test', testRouter);
    app.use('/api/news', newsRouter);
}

module.exports = route