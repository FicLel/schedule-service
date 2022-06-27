import {Router, Request, Response} from 'express';
import { SchoolYear } from '../models/SchoolYear';
import {ServiceSchoolYear} from '../services/ServiceSchoolYear';
class ControllerSchoolYear {
  
  async createSchoolYear(req: Request, res: Response) {
    const {startDate, endDate, isActive}: {startDate: string, endDate: string, isActive: boolean} = req.body;
    const schoolyear: SchoolYear = await new ServiceSchoolYear().create(startDate, endDate, isActive);
    if (schoolyear === null) res.status(400).send('Cannont create school year');
    else res.status(201).json(schoolyear)
  }
  async updateSchoolYear(req: Request, res: Response) {
    const {startDate, endDate, isActive}: {startDate: string, endDate: string, isActive: boolean} = req.body;
    const id: string = req.params.id;
    const response = await new ServiceSchoolYear().update(id, startDate, endDate, isActive);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('SchoolYear not Found, cannont update');
  }
  async deleteSchoolYear(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceSchoolYear().delete(id);
    if (response) res.status(200).send('SchoolYear deleted succesfully');
    else res.status(404).send('SchoolYear not Found');
  }
  async findSchoolYears(req: Request, res: Response) {
    const response = await new ServiceSchoolYear().find();
    res.status(200).json(response);
  }

  async findSchoolYear(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceSchoolYear().findOne(id);
   if (response)  res.status(200).json(response);
    else res.status(404).send('SchoolYear not Found');
  }
  
  async findActiveSchoolYear(req: Request, res: Response) {
    
    const response: SchoolYear = await new ServiceSchoolYear().findActiveYear();
    if (response) res.status(200).json(response);
    else res.status(404).send('SchoolYear not Found');
  }

}; 

export default async (router: Router) =>  {
  const controller: ControllerSchoolYear =  new ControllerSchoolYear();
  
  router.post('/schoolyear', controller.createSchoolYear);
  router.put('/schoolyear/:id', controller.updateSchoolYear);
  router.delete('/schoolyear/:id', controller.deleteSchoolYear);
  router.get('/schoolyear', controller.findSchoolYears);
  router.get('/schoolyear/active', controller.findActiveSchoolYear);
  router.get('/schoolyear/:id', controller.findSchoolYear);
  
}
