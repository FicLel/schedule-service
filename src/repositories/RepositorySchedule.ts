import { ObjectId, WithId, Document, AggregationCursor } from 'mongodb';
import {BaseRepository} from '../base/AbstractBaseRepository';
import { Schedule } from '../models/Schedule';

export class RepositorySchedule extends BaseRepository<Schedule> {
  async findAssignedScheduleByCourses(ids: ObjectId[]): Promise<WithId<Document>[]> {
    const data = await this._collection.find({'courseDegreeGroup': {'$in': ids} }).toArray();
    return data;
  }
  async findAssignedScheduleByGroup(id: ObjectId): Promise<Document[]> {
    const data = await this._collection.aggregate([
      {
          '$lookup': {
              'from': 'CourseDegreeGroup',
              "foreignField": '_id',
              'localField': 'courseDegreeGroup',
              'as': 'group'
          },
      },{
          '$match': {
              'group.group': {$in: [id]} 
          },
      }
    ]).toArray();
    return data;
  }
  async verifyRooOccupation(interval: ObjectId, day: number): Promise<WithId<Document>[]> {
    const data = await this._collection.find({
      '$and': [
          {hourInterval: interval},
          {day: day}
      ]
    }).toArray();
    
    return data;
  }

  async verifyHourIntervalAvailability(interval: ObjectId, courseDegreeGroup: ObjectId, day: number ): Promise<WithId<Document>> {
    const data: WithId<Document> = await this._collection.findOne({
      $and: [
        {courseDegreeGroup: courseDegreeGroup},
        {hourInterval: interval},
        {day: day}
      ]
    });
    console.log(data);
    return data;
  }

 async findAssignedScheduleByTeacher(id: ObjectId): Promise<Document[]> {
   const data = await this._collection.aggregate([
    {
        '$lookup': {
            'from': 'CourseDegreeGroup',
            "foreignField": '_id',
            'localField': 'courseDegreeGroup',
            'as': 'group'
        },
    },{
        '$match': {
            'group.teachers': {$in: [id]} 
        },
    }
  ]).toArray();
  return data;
 }
 async findAssignedScheduleByTeachers(id: ObjectId[]): Promise<Document[]> {
  const data = await this._collection.aggregate([
   {
       '$lookup': {
           'from': 'CourseDegreeGroup',
           "foreignField": '_id',
           'localField': 'courseDegreeGroup',
           'as': 'group'
       },
   },{
       '$match': {
           'group.teachers': {$in: id} 
       },
   }
 ]).toArray();
 return data;
}
}