import { RepositoryGroup } from '../repositories/RepositoryGroup';
import { RepositoryDegree } from '../repositories/RepositoryDegree';
import { Group } from '../models/Group';
import { Degree } from '../models/Degree';
import { DbInstance } from '../config/db-connector';
import { DB_CREDENTIALS } from '../environment/variables';
import { ObjectId, MongoError, Db} from 'mongodb';
import { IGroupResponse } from '../interfaces/IGroupResponse';

export class ServiceGroup {

  async create(code: string, quantity: number, degree: string, father: string = null): Promise<Group> {
    
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositoryGroup = new RepositoryGroup(db, 'Group');
    const reposotiryDegree: RepositoryDegree = new RepositoryDegree(db, 'Degree');

    const group: Group = new Group(code, quantity, new ObjectId(degree), father !== null ? new ObjectId(father) : null );
    const id: ObjectId = await reposotiry.create(group);
    group.setId(id);
    
    const tempDegreeValuee: ObjectId = new ObjectId(degree);
    const tempDegree = await reposotiryDegree.findOne(tempDegreeValuee);
    group.setDegree(new Degree(tempDegree?.name, tempDegree?.code, tempDegree?._id));
    
    if (father && father !== null) {
      const tempFatherValuee: ObjectId = new ObjectId(father);
      const tempFather = await reposotiry.findOne(tempFatherValuee);  
      group.setFather(new Group(tempFather?.code, tempFather?.quantity, group.degree, tempFather?.father, tempFather?._id));
    }

    return group;
  }

  async update(id: string, code: string, quantity: number, degree: string, father: string = null): Promise<Group> {
    const group: Group = new Group(code, quantity, new ObjectId(degree), father !== null ? new ObjectId(father) : null , new ObjectId(id));
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositoryGroup = new RepositoryGroup(db, 'Group');
    const response: boolean = await reposotiry.update(id, group);
    if (response) return group;
    return null;
  }


  async delete(id: string): Promise<boolean> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryGroup = new RepositoryGroup(db, 'Group');
    const response = await repository.delete(tempObject);
    
    return response;
  }

  async find(): Promise<Group[]> {
    const tempGroups: Group[] = [];
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryGroup = new RepositoryGroup(db, 'Group');
    const reposotiryDegree: RepositoryDegree = new RepositoryDegree(db, 'Degree');
    const response = await repository.find();
    for await(let group of response) {
      const tempGroupId = new ObjectId(group._id)

      const tempDegreeValuee: ObjectId = new ObjectId(group?.degree);
      const tempDegree = await reposotiryDegree.findOne(tempDegreeValuee);
      
      const degree = new Degree(tempDegree?.name, tempDegree?.code, tempDegree?._id);

      const tempGroup = new Group(group?.code, group?.quantity, degree);
      
      if (group?.father && group.father !== null) {
        const tempFatherValuee: ObjectId = new ObjectId(group.father);
        const tempFather = await repository.findOne(tempFatherValuee);  
        tempGroup.setFather(new Group(tempFather?.code, tempFather?.quantity, tempGroup.degree, tempFather?.father, tempFather?._id));
      }
      tempGroup.setId(tempGroupId);
      tempGroups.push(tempGroup);
    }
    
    return tempGroups;
  }

  async findOne(id: string): Promise<Group> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryGroup = new RepositoryGroup(db, 'Group');
    const reposotiryDegree: RepositoryDegree = new RepositoryDegree(db, 'Degree');

    const response = await repository.findOne(tempObject);
    const tempGroupId = new ObjectId(response._id)

    const tempDegreeValuee: ObjectId = new ObjectId(response?.degree);
    const tempDegree = await reposotiryDegree.findOne(tempDegreeValuee);
    
    const degree = new Degree(tempDegree?.name, tempDegree?.code, tempDegree?._id);

    const tempGroup = new Group(response?.code, response?.quantity, degree);
    
    if (response?.father && response.father !== null) {
      const tempFatherValuee: ObjectId = new ObjectId(response.father);
      const tempFather = await repository.findOne(tempFatherValuee);  
      tempGroup.setFather(new Group(tempFather?.code, tempFather?.quantity, tempGroup.degree, tempFather?.father, tempFather?._id));
    }
    tempGroup.setId(tempGroupId);
    

    return tempGroup;
  }

  async getGroupsByDegree(): Promise<IGroupResponse> {
    const tempData = await this.find();
    const replace = tempData.reduce((acc, data) => {
      if (acc && acc[data['degree']['name']]) {
        acc[data['degree']['name']].push({_id: data._id, code:data.code});
      } else {
        acc[data['degree']['name']] = [{_id: data._id, code:data.code}];
      }
      return acc;
    }, {});
    return replace;
  }

}