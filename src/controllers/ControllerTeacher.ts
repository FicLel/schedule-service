import {Router, Request, Response} from 'express';
import { Teacher } from '../models/Teacher';
import { IDaysHours } from '../interfaces/IDaysHours';
import {ServiceTeacher} from '../services/ServiceTeacher';
class ControllerTeacher {
  
  async createTeacher(req: Request, res: Response) {
    const {name, busyDays}: {name: string, busyDays: IDaysHours[]} = req.body;
    const teacher: Teacher = await new ServiceTeacher().create(name, busyDays);
    res.status(201).json(teacher)
  }
  async updateTeacher(req: Request, res: Response) {
    const {name, busyDays}: {name: string, busyDays: IDaysHours[]} = req.body;
    const id: string = req.params.id;
    const response = await new ServiceTeacher().update(id, name, busyDays);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('Teacher not Found, cannont update');
  }
  async deleteTeacher(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceTeacher().delete(id);
    if (response) res.status(200).send('Teacher deleted succesfully');
    else res.status(404).send('Teacher not Found');
  }
  async findTeachers(req: Request, res: Response) {
    const response = await new ServiceTeacher().find();
    res.status(200).json(response);
  }

  async findTeacher(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceTeacher().findOne(id);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('Teacher not Found');
  }

}; 

export default async (router: Router) =>  {
  const controller: ControllerTeacher =  new ControllerTeacher();
  
  router.post('/teacher', controller.createTeacher);
  router.put('/teacher/:id', controller.updateTeacher);
  router.delete('/teacher/:id', controller.deleteTeacher);
  router.get('/teacher', controller.findTeachers);
  router.get('/teacher/:id', controller.findTeacher);
}
