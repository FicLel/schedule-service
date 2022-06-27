import {Router, Request, Response} from 'express';
import { HourInterval } from '../models/HourInterval';
import {ServiceHourInterval} from '../services/ServiceHourInterval';
class ControllerHourInterval {
  
  async createHourInterval(req: Request, res: Response) {
    const {start, end}: {start: string, end: string} = req.body;
    const hourinterval: HourInterval = await new ServiceHourInterval().create(start, end);
    if (hourinterval === null) res.status(401).send('Incorrect Data, cannont create');
    else res.status(201).json(hourinterval)
  }
  async updateHourInterval(req: Request, res: Response) {
    const {start, end}: {start: string, end: string}  = req.body;
    const id: string = req.params.id;
    const response = await new ServiceHourInterval().update(id, start, end);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('HourInterval not Found or invalid data, cannont update');
  }
  
  async deleteHourInterval(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceHourInterval().delete(id);
    if (response) res.status(200).send('HourInterval deleted succesfully');
    else res.status(404).send('HourInterval not Found');
  }
  async findHourIntervals(req: Request, res: Response) {
    const response = await new ServiceHourInterval().find();
    res.status(200).json(response);
  }

  async findHourInterval(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceHourInterval().findOne(id);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('HourInterval not Found');
  }

}; 

export default async (router: Router) =>  {
  const controller: ControllerHourInterval =  new ControllerHourInterval();
  
  router.post('/hourinterval', controller.createHourInterval);
  router.put('/hourinterval/:id', controller.updateHourInterval);
  router.delete('/hourinterval/:id', controller.deleteHourInterval);
  router.get('/hourinterval', controller.findHourIntervals);
  router.get('/hourinterval/:id', controller.findHourInterval);
}
