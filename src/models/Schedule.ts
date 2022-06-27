import { ObjectId } from 'mongodb';
import { CourseDegreeGroup } from './CourseDegreeGroup';
import { HourInterval } from './HourInterval';
import { Room } from './Room';
import { SchoolYear } from './SchoolYear';
import { ISchedule } from '../interfaces/ISchedule';

export class Schedule implements ISchedule{
  _id: ObjectId;
  courseDegreeGroup: ObjectId | CourseDegreeGroup;
  room: ObjectId | Room;
  schoolYear: ObjectId | SchoolYear;
  hourInterval: ObjectId | HourInterval;
  day: number;

  constructor(
    courseDegreeGroup: ObjectId | CourseDegreeGroup,
    room: ObjectId | Room,
    schoolYear: ObjectId | SchoolYear,
    hourInterval: ObjectId | HourInterval,
    day: number,
    id: ObjectId = null
  ) {
    this._id = id;
    this.courseDegreeGroup = courseDegreeGroup;
    this.room = room;
    this.schoolYear = schoolYear;
    this.hourInterval = hourInterval;
    this.day = day;
  }
  setId(id: ObjectId) {
    this._id = id;
  }
  setCourseDegreeGroup(courseDegreeGroup: CourseDegreeGroup) {
    this.courseDegreeGroup = courseDegreeGroup;
  }
  setRoom(room: Room) {
    this.room = room;
  }
  setSchoolYear(schoolYear: SchoolYear) {
    this.schoolYear = schoolYear;
  } 
  setHourInterval(hourInterval: HourInterval) {
    this.hourInterval = hourInterval;
  }
  
}