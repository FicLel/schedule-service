import {Router, Request, Response} from 'express';
import {Group} from '../models/Group';
import {ServiceGroup} from '../services/ServiceGroup';
class ControllerGroup {
  
  async createGroup(req: Request, res: Response) {
    const { 
      code, 
      quantity, 
      degree, 
      father
    }: 
    {code: string, quantity: number, degree: string, father: string} = req.body;
    const group: Group = await new ServiceGroup().create(code, quantity, degree, father);
    res.status(201).json(group)
  }
  async updateGroup(req: Request, res: Response) {
    const {code, quantity, degree, father}: 
      {code: string, quantity: number, degree: string, father: string} = req.body;
    
    const id: string = req.params.id;
    const response = await new ServiceGroup().update(id, code, quantity, degree, father);
    if (response !== null) res.status(200).json(response);
    else res.status(404).send('Group not Found, cannont update');
  }
  // We have to work on recursion delete
  async deleteGroup(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceGroup().delete(id);
    if (response) res.status(200).send('Group deleted succesfully');
    else res.status(404).send('Group not Found');
  }
  
  async findGroups(req: Request, res: Response) {
    const response = await new ServiceGroup().find();
    res.status(200).json(response);
  }

  async findGroup(req: Request, res: Response) {
    const id: string = req.params.id;
    const response = await new ServiceGroup().findOne(id);
   if (response)  res.status(200).json(response);
    else res.status(404).send('Group not Found');
  }

  async getGroupsByDegree(req: Request, res: Response) {
    try {
    const response = await new ServiceGroup().getGroupsByDegree();
    res.status(200).json(response);
    } catch (exception) {
      console.log(exception);
      res.status(500).send('Something went wrong');
    }
  }

  async getGroupsToAssign() {

  }

  async getAssignedGroups() {
    
  }

}; 

export default async (router: Router) =>  {
  const controller: ControllerGroup =  new ControllerGroup();
  
  router.get('/group/degree', controller.getGroupsByDegree);
  router.post('/group', controller.createGroup);
  router.put('/group/:id', controller.updateGroup);
  router.delete('/group/:id', controller.deleteGroup);
  router.get('/group', controller.findGroups);
  router.get('/group/:id', controller.findGroup);
}
