const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');      
const mongoose = require('mongoose');
const { check } = require('express-validator');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const envVars = require('dotenv').config();
const port = 3001;
const portSocket = 3002;
const msgController = require('./controllers/messages').socketMessage;
const signup = require('./controllers/auth').signup;
const login = require('./controllers/auth').login;
const isAuthorized = require('./controllers/auth').isAuthorized;
const usersRouter = require('./routes/users');
const messageRouter = require('./routes/messages');
const chatroomsRouter = require('./routes/chatrooms');
const friendRouter = require('./routes/friend');

if (envVars.error){
    console.log('error parsing environment variables')
};

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect('mongodb://localhost/chatBoisUsers' , {useNewUrlParser: true, useCreateIndex: true})
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.post('/signup', [
  check('email').isEmail(),
  check('displayName').isLength({ min: 3 }),
  check('password').isLength({ min: 5 })
], signup);

app.post('/login', [
  check('email').isEmail(),
  check('password').isLength({ min: 5 })
], login);

app.use('/api', isAuthorized)
app.use('/api/users', usersRouter);
app.use('/api/messages', messageRouter);
app.use('/api/chatrooms', chatroomsRouter);
app.use('/api/friend', friendRouter);

io.on('connection', (socket) => {
    msgController(socket, io);
});

app.listen(port, console.log("Server started on port: " + port));

http.listen(portSocket, () => {
    console.log('listening on *: ' + portSocket);
});