import {Router, Request, Response} from 'express';
import { Degree } from '../models/Degree';
import {ServiceDegree} from '../services/ServiceDegree';
class ControllerDegree {
  
  async createDegree(req: Request, res: Response) {
    const {name, code}: {name: string, code: string} = req.body;
    const degree: Degree = await new ServiceDegree().create(name, code);
    res.status(201).json(degree)
  }
  async updateDegree(req: Request, res: Response) {
    const {name, code}: {name: string, code: string} = req.body;
    const id: string = req.params.id;
    const response = await new ServiceDegree().update(id, code, name);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('Degree not Found, cannont update');
  }
  async deleteDegree(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceDegree().delete(id);
    if (response) res.status(200).send('Degree deleted succesfully');
    else res.status(404).send('Degree not Found');
  }
  async findDegrees(req: Request, res: Response) {
    const response = await new ServiceDegree().find();
    res.status(200).json(response);
  }

  async findDegree(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceDegree().findOne(id);
   if (response)  res.status(200).json(response);
    else res.status(404).send('Degree not Found');
  }

}; 

export default async (router: Router) =>  {
  const controller: ControllerDegree =  new ControllerDegree();
  
  router.post('/degree', controller.createDegree);
  router.put('/degree/:id', controller.updateDegree);
  router.delete('/degree/:id', controller.deleteDegree);
  router.get('/degree', controller.findDegrees);
  router.get('/degree/:id', controller.findDegree);
}
