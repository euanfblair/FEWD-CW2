const express = require('express');
const cors = require('cors');
const path = require('path')
const passport = require('passport');

const http = require('http');
const { Server } = require("socket.io");

require('./config/passport')(passport);
require('dotenv').config()

const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {

        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected via WebSocket:', socket.id);


    socket.on('join_family', (familyId) => {
        if (familyId) {
            socket.join('family_' + familyId);
            console.log(`Socket ${socket.id} joined room: family_${familyId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.use(cors());
const bodyParser = require('body-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = require('./routes/foRoutes')

const public = path.join(__dirname, 'public');
app.use(express.static(public));

const clientBuild = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuild));

app.use(bodyParser.urlencoded({ extended: false }));

const cookieParser = require('cookie-parser')
app.use(cookieParser())


app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/', router);

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}. Ctrl^c to quit.`)
})