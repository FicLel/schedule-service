import {Router, Request, Response, NextFunction} from 'express';
import { Schedule } from '../models/Schedule';
import { IScheduleRequest } from '../interfaces/IScheduleRequest';
import {ServiceSchedule} from '../services/ServiceSchedule';

export class ControllerSchedule {
  
  async createSchedule(req: Request, res: Response, next: NextFunction) {
    
    const data: IScheduleRequest = req.body;

    const schedule: Schedule = await new ServiceSchedule().create(data);
    if (schedule) res.status(201).json(schedule)
    else res.status(400).send('something else is there')
    next();
  }
  
  async updateSchedule(req: Request, res: Response) {
    const data: IScheduleRequest = req.body;
    data.id = req.params.id;
    const response = await new ServiceSchedule().update(data);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('Schedule not Found, cannont update');
  }
  
  async deleteSchedule(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceSchedule().delete(id);
    if (response) res.status(200).json({message: 'Schedule deleted succesfully'});
    else res.status(404).send('Schedule not Found');
  }

  async findSchedules(req: Request, res: Response) {
    const response = await new ServiceSchedule().find();
    res.status(200).json(response);
  }

  async findSchedule(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceSchedule().findOne(id);
    if (response)  res.status(200).json(response);
    else res.status(404).send('Schedule not Found');
  }
  async getAsssignedSchedule(req: Request, res: Response) {
    const courseArray = `${req.params.course}${req.params['0']}`.split('/');
    const response = await new ServiceSchedule().findAssignedScheduleByCours(courseArray);
    res.status(200).json(response);
  }
  async getScheduleByGroup(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const response = await new ServiceSchedule().findAssignedScheduleByGroup(id);
      res.status(200).json(response);
    } catch (exception: any) {
      console.log(exception);
      res.status(500).send('Something went wrong');
    }
  }
  async getScheduleByTeacher(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const response = await new ServiceSchedule().findAssignedScheduleByTeacher(id);
      res.status(200).json(response);
    } catch (exception: any) {
      console.log(exception);
      res.status(500).send('Something went wrong');
    }
  }
  async getScheduleByGroupSocket(room) {
    try {
      const response = await new ServiceSchedule().findAssignedScheduleByGroup(room);
      return response;
    } catch (exception: any) {
      console.log(exception);
      return [];
    }
  }
}; 

export default async (router: Router, io: any) =>  {
  const controller: ControllerSchedule =  new ControllerSchedule();
  // Course means group 
  //router.post('/schedule', (req,res) => {res.status(200)});
  router.post('/schedule', controller.createSchedule, async (req: Request, res: Response) => {
    console.log('Schedule Created');
    console.log(req.body.group);
    io.sockets.in(req.body.group).emit('message', await controller.getScheduleByGroupSocket(req.body.group));
  });
  router.put('/schedule/:id', controller.updateSchedule);
  router.get('/schedule/teacher/:id', controller.getScheduleByTeacher);
  router.get('/schedule/group/:id', controller.getScheduleByGroup);
  router.get('/schedule/assigned/(:course)*', controller.getAsssignedSchedule);
  router.delete('/schedule/:id', controller.deleteSchedule, async (req: Request, res: Response) => {
    console.log('Schedule Deleted');
    console.log(req.body.group);
    io.sockets.in(req.body.group).emit('message', await controller.getScheduleByGroupSocket(req.body.group));
  });
  router.get('/schedule', controller.findSchedules);
  router.get('/schedule/:id', controller.findSchedule);
}
