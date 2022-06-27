import { RepositoryCourseDegreeGroup } from '../repositories/RepositoryCourseDegreeGroup';
import { RepositoryCourse } from '../repositories/RepositoryCourse';
import { RepositoryTeacher } from '../repositories/RepositoryTeacher';
import { ServiceGroup } from './ServiceGroup';
import { DbInstance } from '../config/db-connector';
import { DB_CREDENTIALS } from '../environment/variables';
import { ObjectId, MongoError, Db } from 'mongodb';
import { CourseDegreeGroup } from '../models/CourseDegreeGroup';
import { Course } from '../models/Course';
import { Group } from '../models/Group';
import { Teacher } from '../models/Teacher';
import { RepositoryGroup } from '../repositories/RepositoryGroup';

export class ServiceCourseDegreeGroup {

  async create(course: string, groups: string[], teachers: string[]): Promise<CourseDegreeGroup> {
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const tempDegreeId: ObjectId = new ObjectId(course);
    const tempGroupId: ObjectId[] = groups.map((group) => new ObjectId(group));
    const tempTeachersId: ObjectId[] = teachers.map((teacher) => new ObjectId(teacher));  

    const repositoryTeacher: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
    const reposotiry: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const repositoryCourse: RepositoryCourse = new RepositoryCourse(db, 'Course');
    const repositoryGroup: RepositoryGroup = new RepositoryGroup(db, 'Group');
    
    const coursedegreegroup: CourseDegreeGroup = new CourseDegreeGroup(tempDegreeId, tempGroupId, tempTeachersId);
    const id: ObjectId = await reposotiry.create(coursedegreegroup);
    
    coursedegreegroup.setId(id);

    const tempDegree = await repositoryCourse.findOne(tempDegreeId);
    coursedegreegroup.setCourse(new Course(tempDegree?.name, tempDegree?.code, tempDegree?.hours, tempDegree?._id));
    
    const tempGroupResponse = await repositoryGroup.findManyGroup(tempGroupId);
    const tempGroup: Group[] = [];
    tempGroupResponse.forEach((g) => {
      tempGroup.push(new Group(g?.code, g?.quantity, g?.degree, g?.father, g?._id));
    }) 
    coursedegreegroup.setGroup(tempGroup);

    const tempTeachers = await repositoryTeacher.findManyTeachers(tempTeachersId);
    const tempTeachersArray: Teacher[] = [];
    tempTeachers.forEach((teacher) => {
      tempTeachersArray.push(new Teacher(teacher?.name, teacher?.busyDays, teacher?._id));
    }) 
    coursedegreegroup.setTeachers(tempTeachersArray);
    return coursedegreegroup;
  }

  async update(id: string, degree: string, groups: string[], teachers: string[]): Promise<CourseDegreeGroup> {
    
    const tempObject: ObjectId = new ObjectId(id);
    const tempDegreeId: ObjectId = new ObjectId(degree);
    const tempGroupId: ObjectId[] = groups.map((group) => new ObjectId(group));
    const tempTeachersId: ObjectId[] = teachers.map((teacher) => new ObjectId(teacher));
    const coursedegreegroup: CourseDegreeGroup = new CourseDegreeGroup(tempDegreeId, tempGroupId, tempTeachersId, tempObject);
    
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repositoryTeacher: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
    const reposotiry: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const repositoryDegree: RepositoryCourse = new RepositoryCourse(db, 'Course');
    const repositoryGroup: RepositoryGroup = new RepositoryGroup(db, 'Group');
    
    const response: boolean = await reposotiry.update(id, coursedegreegroup);

    const tempDegree = await repositoryDegree.findOne(tempDegreeId);
    coursedegreegroup.setCourse(new Course(tempDegree?.name, tempDegree?.code, tempDegree?.hours, tempDegree?._id));
    
    const tempGroupResponse = await repositoryGroup.findManyGroup(tempGroupId);
    const tempGroup: Group[] = [];
    tempGroupResponse.forEach((g) => {
      tempGroup.push(new Group(g?.code, g?.quantity, g?.degree, g?.father, g?._id));
    }); 
    coursedegreegroup.setGroup(tempGroup);

    const tempTeachers = await repositoryTeacher.findManyTeachers(tempTeachersId);
    const tempTeachersArray: Teacher[] = [];
    tempTeachers.forEach((teacher) => {
      tempTeachersArray.push(new Teacher(teacher?.name, teacher?.busyDays, teacher?._id));
    }) 
    coursedegreegroup.setTeachers(tempTeachersArray);

    if (response) return coursedegreegroup;
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const response = await repository.delete(tempObject);
    
    return response;
  }

  async find(): Promise<CourseDegreeGroup[]> {
    const tempCourseDegreeGroup: CourseDegreeGroup[] = [];
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repositoryTeacher: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
    const reposotiry: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const repositoryDegree: RepositoryCourse = new RepositoryCourse(db, 'Course');
    const repositoryGroup: RepositoryGroup = new RepositoryGroup(db, 'Group');
    
    const response = await reposotiry.find();
    let tempContainer: CourseDegreeGroup; 
    for await (let courseDegreeGroup of response) {
      tempContainer = new CourseDegreeGroup(courseDegreeGroup?.degree, courseDegreeGroup?.group, courseDegreeGroup?.teaches, courseDegreeGroup?._id)
      const tempCourse = await repositoryDegree.findOne(courseDegreeGroup?.course);
      tempContainer.setCourse(new Course(tempCourse?.name, tempCourse?.code, tempCourse?.hours, tempCourse?._id));
      
      const tempGroupResponse = await repositoryGroup.findManyGroup(courseDegreeGroup?.group);
      const tempGroup: Group[] = [];
      tempGroupResponse.forEach((g) => {
        tempGroup.push(new Group(g?.code, g?.quantity, g?.degree, g?.father, g?._id));
      }) 
      tempContainer.setGroup(tempGroup);

      const tempTeachers = await repositoryTeacher.findManyTeachers(courseDegreeGroup?.teachers);
      const tempTeachersArray: Teacher[] = [];
      let tempTeachersObject: Teacher;
      tempTeachers.forEach((teacher) => {
        tempTeachersObject = new Teacher(teacher?.name, teacher?.busyDays, teacher?._id);
        tempTeachersObject.changeHoursFromBusyDays(this.transformmMinutesToHours);
        tempTeachersArray.push(tempTeachersObject);
      }) 
      tempContainer.setTeachers(tempTeachersArray);
      tempCourseDegreeGroup.push(tempContainer);
    };
    return tempCourseDegreeGroup;
  }

  async findOne(id: string): Promise<CourseDegreeGroup> {
    const tempObject: ObjectId = new ObjectId(id);
    
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repositoryTeacher: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
    const repository: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const repositoryCourse: RepositoryCourse = new RepositoryCourse(db, 'Course');
    const repositoryGroup: RepositoryGroup = new RepositoryGroup(db, 'Group');
    
    const response = await repository.findOne(tempObject);
    if (!response?._id || response?.id === null) {
      return null;
    }
    const tempContainer = new CourseDegreeGroup(response?.course, response?.group, response?.teaches, response?._id)
    const tempCourse = await repositoryCourse.findOne(response?.course);
    tempContainer.setCourse(new Course(tempCourse?.name, tempCourse?.code, tempCourse?.hours, tempCourse?._id));
    
    const tempGroupResponse = await repositoryGroup.findManyGroup(response?.group);
    const tempGroup: Group[] = [];
    tempGroupResponse.forEach((g) => {
      tempGroup.push(new Group(g?.code, g?.quantity, g?.degree, g?.father, g?._id));
    }) 
    tempContainer.setGroup(tempGroup);

    const tempTeachers = await repositoryTeacher.findManyTeachers(response?.teachers);
    const tempTeachersArray: Teacher[] = [];
    tempTeachers.forEach((teacher) => {
      tempTeachersArray.push(new Teacher(teacher?.name, teacher?.busyDays, teacher?._id));
    }) 

    tempContainer.setTeachers(tempTeachersArray);
    
    return tempContainer;
  }

  async getByGroup(id: string): Promise<CourseDegreeGroup[]> {
    const groupId: ObjectId = new ObjectId(id);
    const tempCourseDegreeGroup: CourseDegreeGroup[] = [];
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repositoryTeacher: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
    const reposotiry: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const repositoryDegree: RepositoryCourse = new RepositoryCourse(db, 'Course');
    const repositoryGroup: RepositoryGroup = new RepositoryGroup(db, 'Group');
    
    const response = await reposotiry.getCourseByGroup(groupId);
    let tempContainer: CourseDegreeGroup; 
    for await (let courseDegreeGroup of response) {
      tempContainer = new CourseDegreeGroup(courseDegreeGroup?.degree, courseDegreeGroup?.group, courseDegreeGroup?.teaches, courseDegreeGroup?._id)
      const tempCourse = await repositoryDegree.findOne(courseDegreeGroup?.course);
      tempContainer.setCourse(new Course(tempCourse?.name, tempCourse?.code, tempCourse?.hours, tempCourse?._id));
      
      const tempGroupResponse = await repositoryGroup.findManyGroup(courseDegreeGroup?.group);
      const tempGroup: Group[] = [];
      tempGroupResponse.forEach((g) => {
        tempGroup.push(new Group(g?.code, g?.quantity, g?.degree, g?.father, g?._id));
      }) 
      tempContainer.setGroup(tempGroup);

      const tempTeachers = await repositoryTeacher.findManyTeachers(courseDegreeGroup?.teachers);
      const tempTeachersArray: Teacher[] = [];
      let tempTeachersObject: Teacher;
      tempTeachers.forEach((teacher) => {
        tempTeachersObject = new Teacher(teacher?.name, teacher?.busyDays, teacher?._id);
        tempTeachersObject.changeHoursFromBusyDays(this.transformmMinutesToHours);
        tempTeachersArray.push(tempTeachersObject);
      }) 
      tempContainer.setTeachers(tempTeachersArray);
      tempCourseDegreeGroup.push(tempContainer);
    };
    return tempCourseDegreeGroup;
  }

  transformmMinutesToHours(time: number): string {
    
    const tempHours: number  = time / 60;
    const tempMinutes: number = time % 60;
     
    const hours: number = parseInt(tempHours.toString(), 10);
    const minutes: number = parseInt(tempMinutes.toString(), 10);
    if (hours < 0 || hours > 23 || minutes > 59 || minutes < 0) {
      return 'Hora invalida';
    } 
  
    return ''+hours+':'+minutes;
  };

}