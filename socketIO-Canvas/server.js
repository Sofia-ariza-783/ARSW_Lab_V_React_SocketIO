var http = require("http");
var { Server } = require("socket.io");

var server = http.createServer();
var io = new Server(
    server,
    {
        cors: {
            origin: "*"
        }
    }
);

io.on( "connection", function (socket) {
    socket.on("drawEvent", function (data) {
        io.emit("broadcast", data);
    });

    socket.on("disconnect", function () {
        console.log("disconnected");
    })
});

server.listen(3000, function (){
    console.log("Server started in http://localhost:3000");
});