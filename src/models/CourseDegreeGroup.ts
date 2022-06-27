import { ObjectId } from 'mongodb';
import { Course } from './Course';
import { Group } from './Group';
import { Teacher } from './Teacher';

export class CourseDegreeGroup {
  _id: ObjectId | null;
  course: ObjectId | Course;
  group: ObjectId[] | Group[];
  teachers: ObjectId[] | Teacher[];

  constructor(course: ObjectId, group: ObjectId[], teachers: ObjectId[], id: ObjectId = null) {
    this._id = id;
    this.course = course;
    this.group = group;
    this.teachers = teachers;
  }
  setId(id: ObjectId) {
    this._id = id;
  }
  setCourse(degree: Course) {
    this.course = degree;
  }
  setGroup(group: Group[]) {
    this.group = group;
  }
  setTeachers(teachers: Teacher[]) {
    this.teachers = teachers;
  }
} 