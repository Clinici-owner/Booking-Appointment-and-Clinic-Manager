const userRouter = require('./user')
const staffRouter = require('./staff')
const authRouter = require('./auth')
const serviceRouter = require('./service')

function route(app) {
    app.use('/api/user', userRouter);
    app.use('/api/staff', staffRouter);
    app.use('/auth/google', authRouter);
    app.use('/api/service', serviceRouter);
}

module.exports = route