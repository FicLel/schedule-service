import {Router, Request, Response} from 'express';
import {CourseDegreeGroup} from '../models/CourseDegreeGroup';
import {ServiceCourseDegreeGroup} from '../services/ServiceCourseDegreeGroup';
class ControllerCourseDegreeGroup {
  
  async createDegreeGroup(req: Request, res: Response) {
    const { 
      course, 
      group, 
      teachers
    }: 
    {course: string, group: string[], teachers: string[]} = req.body;
    const degreegroup: CourseDegreeGroup = await new ServiceCourseDegreeGroup().create(course, group, teachers);
    res.status(201).json(degreegroup)
  }
  async updateDegreeGroup(req: Request, res: Response) {
    const { 
      course, 
      group, 
      teachers
    }: 
    {course: string, group: string[], teachers: string[]} = req.body;
    
    const id: string = req.params.id;
    const response = await new ServiceCourseDegreeGroup().update(id, course, group, teachers);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('DegreeGroup not Found, cannont update');
  }
  // We have to work on recursion delete
  async deleteDegreeGroup(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceCourseDegreeGroup().delete(id);
    if (response) res.status(200).send('DegreeGroup deleted succesfully');
    else res.status(404).send('DegreeGroup not Found');
  }
  
  async findDegreeGroups(req: Request, res: Response) {
    const response = await new ServiceCourseDegreeGroup().find();
    res.status(200).json(response);
  }

  async findDegreeGroup(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceCourseDegreeGroup().findOne(id);
    if (response)  res.status(200).json(response);
    else res.status(404).send('DegreeGroup not Found');
  }

  async findCourseByGroup(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceCourseDegreeGroup().getByGroup(id);
    if (response)  res.status(200).json(response);
    else res.status(404).send('DegreeGroup not Found');
  }

  async findDegreeGroupByCourse(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceCourseDegreeGroup().findByCourse(id);
    if (response)  res.status(200).json(response);
    else res.status(404).send('DegreeGroup not Found');
  }

}; 

export default async (router: Router) =>  {
  const controller: ControllerCourseDegreeGroup =  new ControllerCourseDegreeGroup();
  
  router.post('/coursedegreegroup', controller.createDegreeGroup);
  router.put('/coursedegreegroup/:id', controller.updateDegreeGroup);
  router.delete('/coursedegreegroup/:id', controller.deleteDegreeGroup);
  router.get('/coursedegreegroup', controller.findDegreeGroups);
  router.get('/coursedegreegroup/group/:id', controller.findCourseByGroup);
  router.get('/coursedegreegroup/:id', controller.findDegreeGroup);
}
