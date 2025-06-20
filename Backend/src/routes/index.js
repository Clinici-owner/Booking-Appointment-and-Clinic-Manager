const userRouter = require('./user')
const staffRouter = require('./staff')
const authRouter = require('./auth')
const serviceRouter = require('./service')
const patientRouter = require('./patient')

function route(app) {
    app.use('/api/user', userRouter);
    app.use('/api/staff', staffRouter);
    app.use('/auth/google', authRouter);
    app.use('/api/service', serviceRouter);
    app.use('/api/patient', patientRouter);
}

module.exports = route