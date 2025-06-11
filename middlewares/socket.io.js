let io;

const initializeSocket = (server) => {
    io = require('socket.io')(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on("connection", (socket) => {
        console.log(`User Connected: ${socket.id}`);
        socket.on("disconnect", (reason) => {
            console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
        });
    });
};


const emitEvent = (eventName, data) => {
    if (io) {
        io.emit(eventName, data);
    }
};

module.exports = { initializeSocket, emitEvent };
