const userRouter = require('./user')

const staffRouter = require('./staff')


function route(app) {
    app.use('/api/user', userRouter);
    app.use('/api/staff', staffRouter);
}

module.exports = route