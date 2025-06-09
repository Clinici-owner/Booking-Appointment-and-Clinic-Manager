const userRouter = require('./user')
const staffRouter = require('./staff')
const authRouter = require('./auth')


function route(app) {
    app.use('/api/user', userRouter);
    app.use('/api/staff', staffRouter);
    app.use('/auth/google', authRouter);
}

module.exports = route