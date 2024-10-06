const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

// Set the view engine to EJS
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use('/peerjs', peerServer);

// Redirect to a random UUID
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`); // Use backticks for template literals
});

// Render a room page with the room ID
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room }); // Render the room template and pass roomId
});

// Enable CORS for all routes
const cors = require('cors');
app.use(cors());

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
        socket.to(roomId).emit('user-connected', userId);
        socket.on('message', message =>{
         io.to(roomId).emit('createMessage', message)
        })
    });
});

// Listen on port 3000
server.listen(3050, () => {
    console.log('Server is running on port 3050');
});
