import {Router, Request, Response} from 'express';
import { Course } from '../models/Course';
import {ServiceCourse} from '../services/ServiceCourse';
class ControllerCourse {
  
  async createCourse(req: Request, res: Response) {
    const {name, code, hours}: {name: string, code: string, hours: number} = req.body;
    const course: Course = await new ServiceCourse().create(name, code, hours);
    res.status(201).json(course)
  }
  async updateCourse(req: Request, res: Response) {
    const {name, code, hours}: {name: string, code: string, hours: number} = req.body;
    const id: string = req.params.id;
    const response = await new ServiceCourse().update(id, code, name, hours);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('Course not Found, cannont update');
  }
  async deleteCourse(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceCourse().delete(id);
    if (response) res.status(200).send('Course deleted succesfully');
    else res.status(404).send('Course not Found');
  }
  async findCourses(req: Request, res: Response) {
    const response = await new ServiceCourse().find();
    res.status(200).json(response);
  }

  async findCourse(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceCourse().findOne(id);
   if (response)  res.status(200).json(response);
    else res.status(404).send('Course not Found');
  }

}; 

export default async (router: Router) =>  {
  const controller: ControllerCourse =  new ControllerCourse();
  
  router.post('/course', controller.createCourse);
  router.put('/course/:id', controller.updateCourse);
  router.delete('/course/:id', controller.deleteCourse);
  router.get('/course', controller.findCourses);
  router.get('/course/:id', controller.findCourse);
}
