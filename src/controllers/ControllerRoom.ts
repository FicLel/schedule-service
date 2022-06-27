import {Router, Request, Response} from 'express';
import { Room } from '../models/Room';
import {ServiceRoom} from '../services/ServiceRoom';
class ControllerRoom {
  
  async createRoom(req: Request, res: Response) {
    const {name, capacity}: {name: string, capacity: number} = req.body;
    const room: Room = await new ServiceRoom().create(name, capacity);
    res.status(201).json(room)
  }
  async updateRoom(req: Request, res: Response) {
    const {name, capacity}: {name: string, capacity: number} = req.body;
    const id: string = req.params.id;
    const response = await new ServiceRoom().update(id, name, capacity);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('Room not Found, cannont update');
  }
  async deleteRoom(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceRoom().delete(id);
    if (response) res.status(200).send('Room deleted succesfully');
    else res.status(404).send('Room not Found');
  }
  async findRooms(req: Request, res: Response) {
    const response = await new ServiceRoom().find();
    res.status(200).json(response);
  }

  async findRoom(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceRoom().findOne(id);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('Room not Found');
  }
  async findAvailableRooms(req: Request, res: Response) {
    try {
      
      const hourInterval: string = req.params.interval;
      const day: number = parseInt(req.params.day);
      const quantity: number = parseInt(req.params.quantity, 10); 
      const response = await new ServiceRoom().getAvailableRoomsForSchedule({hourInterval, day, quantity});
      if (response) res.status(200).json(response);
      else res.status(404).send('Nothing found');
    } catch (exception) {
      console.log(exception);
      res.status(500).send('Something went wrong');
    }
  }
}; 

export default async (router: Router) =>  {
  const controller: ControllerRoom =  new ControllerRoom();
  router.get('/room/avaible/interval/:interval/day/:day/quantity/:quantity', controller.findAvailableRooms)
  router.post('/room', controller.createRoom);
  router.put('/room/:id', controller.updateRoom);
  router.delete('/room/:id', controller.deleteRoom);
  router.get('/room', controller.findRooms);
  router.get('/room/:id', controller.findRoom);
}
