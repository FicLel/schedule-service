import {PORT} from './environment/variables';
import express, { Express, Router } from 'express';
import bodyParser from 'body-parser';
import http from 'http';

import { Server } from 'socket.io';
import cors from 'cors';

import { authMiddleware } from './middleware/request-log-middleware';
import ControllerDegree from './controllers/ControllerDegree';
import ControllerGroup from './controllers/ControllerGroup';
import ControllerCourse from './controllers/ControllerCourse';
import ControllerRoom from './controllers/ControllerRoom';
import ControllerHourInterval from './controllers/ControllerHourInterval';
import ControllerTeacher from './controllers/ControllerTeacher';
import ControllerSchoolYear from './controllers/ControllerSchoolYear';
import ControllerCourseDegreeGroup from './controllers/ControllerCourseDegreeGroup';
import ControllerSchedule from './controllers/ControllerSchedule';

const app: Express = express();

const router: Router = express.Router();
const server = http.createServer(app);

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());
app.use(authMiddleware)

const io = new Server(server, {cors: {
  origin: "*",
  methods: ["GET", "POST", "OPTIONS", "DELETE", "PUT"]
}});

io.on('connection', (socket) => {
  console.log('connected');
  console.log(socket.rooms)
  socket.on('schedule', (room) => {
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
  });
  
});

ControllerDegree(router);
ControllerGroup(router);
ControllerCourse(router);
ControllerRoom(router);
ControllerHourInterval(router);
ControllerTeacher(router);
ControllerSchoolYear(router);
ControllerCourseDegreeGroup(router);
ControllerSchedule(router, io);
app.use('/', router);





server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON ${PORT}`);
});
