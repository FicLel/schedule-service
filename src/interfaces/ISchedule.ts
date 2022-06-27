import { ObjectId } from 'mongodb';
import { CourseDegreeGroup } from '../models//CourseDegreeGroup';
import { HourInterval } from '../models//HourInterval';
import { Room } from '../models/Room';
import { SchoolYear } from '../models//SchoolYear';

export interface ISchedule {
  _id: ObjectId;
  courseDegreeGroup: ObjectId | CourseDegreeGroup;
  room: ObjectId | Room;
  schoolYear: ObjectId | SchoolYear;
  hourInterval: ObjectId | HourInterval;
  day: number;

};