import {Server} from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

const connectToSocket = (server) => {
    const io = new Server(server, { // This cors is written only for testing not for production
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        console.log("something connected");
        socket.on("join-call",(path)=> {
            if(connections[path] === undefined){
                connections[path] = [];
            }
            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();
            for(let a = 0;a < connections[path].length; a++){
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
            }

            if(messages[path] != undefined){
                for(let a = 0; a< messages[path].length; a++){
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'],messages[path][a]['socket-id-sender']
                    )
                }
            }

            
        })

        socket.on("signal",(toId,message)=> {
            io.to(toId).emit("signal",socket.id,message);
        })

        socket.on("chat-message",(data,sender)=> {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {

                    if(!isFound && roomValue.includes(socket.id)){
                        return [roomKey,true];
                    }

                    return [room,isFound];
                }, ['', false]);
            
                if(found === true){
                    if(messages[matchingRoom] === undefined){
                        messages[matchingRoom] = []
                    }

                    messages[matchingRoom].push({'sender': sender, 'data': data, 'socket-id-sender': socket.id})
                    console.log("message", matchingRoom, ":", sender, data);

                    connections[matchingRoom].forEach((elem) => {
                        io.to(elem).emit("chat-message", data, sender, socket.id)
                    })
                }
        })

        socket.on("disconnect",()=> {
            let roomFound = null;

            for(const[roomKey, socketList] of Object.entries(connections)){
                if(socketList.includes(socket.id)){
                    roomFound = roomKey;
                    break;
                }
            }

            if(roomFound){
                const startTime = timeOnline[socket.id];
                const totalTime = startTime ? Math.floor((new Date() - startTime) / 1000) : 0;

                connections[roomFound] = connections[roomFound].filter(id => id !== socket.id);

                connections[roomFound].forEach(id => {
                    io.to(id).emit("user-left", socket.id, totalTime);
                });

                if(connections[roomFound].length === 0){
                    delete connections[roomFound];
                    delete messages[roomFound];
                }
            }
            delete timeOnline[socket.id];
        });
    })
    return io;
}

export default connectToSocket; 