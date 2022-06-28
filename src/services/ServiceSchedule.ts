import { RepositorySchedule } from '../repositories/RepositorySchedule';
import { RepositoryCourseDegreeGroup } from '../repositories/RepositoryCourseDegreeGroup';
import { ServiceCourseDegreeGroup } from './ServiceCourseDegreeGroup';
import { RepositoryRoom } from '../repositories/RepositoryRoom';
import { RepositoryHourInterval } from '../repositories/RepositoryHourInterval';
import { RepositorySchoolYear } from '../repositories/RepositorySchoolYear';
import { Schedule } from '../models/Schedule';
import { Room } from '../models/Room';
import { CourseDegreeGroup } from '../models/CourseDegreeGroup';
import { SchoolYear } from '../models/SchoolYear';
import { HourInterval } from '../models/HourInterval';
import { ServiceHourInterval } from './ServiceHourInterval';

import { DbInstance } from '../config/db-connector';
import { DB_CREDENTIALS } from '../environment/variables';
import { ObjectId, MongoError,Db } from 'mongodb';
import { IScheduleRequest } from '../interfaces/IScheduleRequest';
import { IScheduleResponse } from '../interfaces/IScheduleResponse';
import { RepositoryTeacher } from '../repositories/RepositoryTeacher';
import { Teacher } from '../models/Teacher';
import { ServiceTeacher } from './ServiceTeacher';

import {convertHourToMinutes} from '../config/minutes-converter';


export class ServiceSchedule {

  async create(schedule: IScheduleRequest): Promise<Schedule> {
    try {
      const courseDegreeGroup: ObjectId = new ObjectId(schedule.courseDegreeGroup);
      const room: ObjectId = new ObjectId(schedule.room);
      const schoolYear: ObjectId = new ObjectId(schedule.schoolYear);
      const hourInterval: ObjectId = new ObjectId(schedule.hourInterval);
      
      
      const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
      const reposotiry: RepositorySchedule = new RepositorySchedule(db, 'Schedule');
      const repositoryCourseDegreeGroup: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
      const repositoryRoom: RepositoryRoom = new RepositoryRoom(db, 'Room');
      const repositorySchoolYear: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
      const repositoryHourInterval: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');
      const repositoryTeacher: RepositoryTeacher = new RepositoryTeacher(db, 'Teacher');
      ///// Verify availibilty with teacher
      const verifyHourIntervalAvailability = await reposotiry.verifyHourIntervalAvailability(hourInterval, courseDegreeGroup, schedule.day);
      if (verifyHourIntervalAvailability) {
        console.log('Interval not Available');
        return null;
      }

      //Verify if any group related is occupied in this interval
      const degreeGroups = await repositoryCourseDegreeGroup.getCourseByGroup(new ObjectId(schedule.group));
      let validatorGroups = false;
      for await (let degree of degreeGroups) {
        for await (let groupD of degree.group) {
          const verifyGroup = await reposotiry.findAssignedScheduleByGroups(new ObjectId(groupD), hourInterval, schedule.day);
          if (verifyGroup.length > 0) {
            validatorGroups = true;
            break;
          }
        }    
      }
      if (validatorGroups) return null; 
      
      //Verify if theacher is available 
      const tempCourseDegreeGroup = await repositoryCourseDegreeGroup.findOne(courseDegreeGroup);
      const tempHourInterval = await repositoryHourInterval.findOne(hourInterval);
      
      const tempTeacher = await repositoryTeacher.findManyTeachers(tempCourseDegreeGroup.teachers)
      let validatorHour = false;
      for (let teacher of tempTeacher) {
        teacher.busyDays.forEach((day) => {
          if (day.day === schedule.day && day.start ===  tempHourInterval.start && day.end === tempHourInterval.end) {
            console.log('Hour not valid');
            console.log(teacher)
            validatorHour = true;
          }
        });
      }
      if (validatorHour) return null;

      // Verify assigned hour by teacher

      const degreeTeachers = await repositoryCourseDegreeGroup.getCourseByTeacher(new ObjectId(tempCourseDegreeGroup.teachers[0]));
      let validatorTeachers = false;
      for await (let degree of degreeTeachers) {
        for await (let groupD of degree.teachers) {
          const verifyGroup = await reposotiry.findAssignedScheduleByTeacherOnInterval(new ObjectId(groupD), hourInterval, schedule.day);
          if (verifyGroup.length > 0) {
            validatorTeachers = true;
            break;
          }
        }    
      }
      if (validatorTeachers) return null;


      // Assigned Variables
      const tempSchedule: Schedule = new Schedule(courseDegreeGroup, room, schoolYear, hourInterval, schedule.day);
      const id: ObjectId = await reposotiry.create(tempSchedule);
      
      tempSchedule.setId(id);
      tempSchedule.setCourseDegreeGroup(new CourseDegreeGroup(tempCourseDegreeGroup?.degree, tempCourseDegreeGroup?.group, tempCourseDegreeGroup?.teachers, tempCourseDegreeGroup?._id));
      
      const tempRoom = await repositoryRoom.findOne(room);
      tempSchedule.setRoom(new Room(tempRoom?.name, tempRoom?.capacity, tempRoom?._id));

      const tempSchoolYear = await repositorySchoolYear.findOne(schoolYear);
      tempSchedule.setSchoolYear(new SchoolYear(tempSchoolYear?.startDate, tempSchoolYear?.endDate, tempSchoolYear?.isActive, tempSchoolYear?._id));
      
      tempSchedule.setHourInterval(new HourInterval(tempHourInterval?.start, tempHourInterval?.end, tempHourInterval?._id));

      return tempSchedule;
    } catch (exception) {
      console.log(exception);
      return;
    }
  }

  async update(schedule: IScheduleRequest): Promise<Schedule> {
    const courseDegreeGroup: ObjectId = new ObjectId(schedule.courseDegreeGroup);
    const room: ObjectId = new ObjectId(schedule.room);
    const schoolYear: ObjectId = new ObjectId(schedule.schoolYear);
    const hourInterval: ObjectId = new ObjectId(schedule.hourInterval);
    
    const tempSchedule = new Schedule(courseDegreeGroup, room, schoolYear, hourInterval, schedule.day);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositorySchedule = new RepositorySchedule(db, 'Schedule');
    const repositoryCourseDegreeGroup: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const repositoryRoom: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const repositorySchoolYear: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const repositoryHourInterval: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');

    tempSchedule.setId(new ObjectId(schedule.id));
    const response: boolean = await reposotiry.update(schedule?.id, tempSchedule);
    if (response) {
      

      const tempCourseDegreeGroup = await repositoryCourseDegreeGroup.findOne(courseDegreeGroup);
      tempSchedule.setCourseDegreeGroup(new CourseDegreeGroup(tempCourseDegreeGroup?.degree, tempCourseDegreeGroup?.group, tempCourseDegreeGroup?.teachers, tempCourseDegreeGroup?._id));
      
      const tempRoom = await repositoryRoom.findOne(room);
      tempSchedule.setRoom(new Room(tempRoom?.name, tempRoom?.capacity, tempRoom?._id));

      const tempSchoolYear = await repositorySchoolYear.findOne(schoolYear);
      tempSchedule.setSchoolYear(new SchoolYear(tempSchoolYear?.startDate, tempSchoolYear?.endDate, tempSchoolYear?.isActive, tempSchoolYear?._id));
      
      const tempHourInterval = await repositoryHourInterval.findOne(hourInterval);
      tempSchedule.setHourInterval(new HourInterval(tempHourInterval?.start, tempHourInterval?.end, tempHourInterval?._id));

      return tempSchedule;
    };
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositorySchedule = new RepositorySchedule(db, 'Schedule');
    const response = await repository.delete(tempObject);
    
    return response;
  }

  async find(): Promise<Schedule[]> {
    const tempScheduleArray: Schedule[] = [];
    
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositorySchedule = new RepositorySchedule(db, 'Schedule');
    const repositoryCourseDegreeGroup: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const repositoryRoom: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const repositorySchoolYear: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const repositoryHourInterval: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');

    const response = await repository.find();
    let tempSchedule: Schedule;
    for await(let schedule of response) {
      tempSchedule =  new Schedule(schedule?.courseDegreeGroup, schedule?.room, schedule?.schoolYear, schedule?.hourInterval, schedule.day, schedule?._id);

      const tempCourseDegreeGroup = await repositoryCourseDegreeGroup.findOne(schedule?.courseDegreeGroup);
      tempSchedule.setCourseDegreeGroup(new CourseDegreeGroup(tempCourseDegreeGroup?.degree, tempCourseDegreeGroup?.group, tempCourseDegreeGroup?.teachers, tempCourseDegreeGroup?._id));
      
      const tempRoom = await repositoryRoom.findOne(schedule?.room);
      tempSchedule.setRoom(new Room(tempRoom?.name, tempRoom?.capacity, tempRoom?._id));

      const tempSchoolYear = await repositorySchoolYear.findOne(schedule?.schoolYear);
      tempSchedule.setSchoolYear(new SchoolYear(tempSchoolYear?.startDate, tempSchoolYear?.endDate, tempSchoolYear?.isActive, tempSchoolYear?._id));
      
      const tempHourInterval = await repositoryHourInterval.findOne(schedule?.hourInterval);
      tempSchedule.setHourInterval(new HourInterval(tempHourInterval?.start, tempHourInterval?.end, tempHourInterval?._id));

      tempScheduleArray.push(tempSchedule);
    }
    return tempScheduleArray;
  }

  async findOne(id: string): Promise<Schedule> {
    const tempObject: ObjectId = new ObjectId(id);
    
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositorySchedule = new RepositorySchedule(db, 'Schedule');
    const repositoryCourseDegreeGroup: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const repositoryRoom: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const repositorySchoolYear: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const repositoryHourInterval: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');
    
    const response = await repository.findOne(tempObject);
    if (!response?._id || response?.id === null) {
      return null;
    }
    const tempSchedule: Schedule =  new Schedule(response?.courseDegreeGroup, response?.room, response?.schoolYear, response?.hourInterval, response.day, response?._id);

    const tempCourseDegreeGroup = await repositoryCourseDegreeGroup.findOne(response?.courseDegreeGroup);
    tempSchedule.setCourseDegreeGroup(new CourseDegreeGroup(tempCourseDegreeGroup?.degree, tempCourseDegreeGroup?.group, tempCourseDegreeGroup?.teachers, tempCourseDegreeGroup?._id));
    
    const tempRoom = await repositoryRoom.findOne(response?.room);
    tempSchedule.setRoom(new Room(tempRoom?.name, tempRoom?.capacity, tempRoom?._id));

    const tempSchoolYear = await repositorySchoolYear.findOne(response?.schoolYear);
    tempSchedule.setSchoolYear(new SchoolYear(tempSchoolYear?.startDate, tempSchoolYear?.endDate, tempSchoolYear?.isActive, tempSchoolYear?._id));
    
    const tempHourInterval = await repositoryHourInterval.findOne(response?.hourInterval);
    tempSchedule.setHourInterval(new HourInterval(tempHourInterval?.start, tempHourInterval?.end, tempHourInterval?._id));

    return tempSchedule;
  }

  async findAssignedScheduleByCours(id: string[]): Promise<Schedule[]> {
    const tempScheduleArray: Schedule[] = [];
    const idArrays: ObjectId[] = id.map(identifier => new ObjectId(identifier));
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositorySchedule = new RepositorySchedule(db, 'Schedule');
    const repositoryCourseDegreeGroup: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const serviceCourse: ServiceCourseDegreeGroup = new ServiceCourseDegreeGroup();
    const repositoryRoom: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const repositorySchoolYear: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const repositoryHourInterval: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');

    const response = await repository.findAssignedScheduleByCourses(idArrays);
    let tempSchedule: Schedule;
    for await(let schedule of response) {
      tempSchedule =  new Schedule(schedule?.courseDegreeGroup, schedule?.room, schedule?.schoolYear, schedule?.hourInterval, schedule.day, schedule?._id);

      const tempCourseDegreeGroup: CourseDegreeGroup = await serviceCourse.findOne(schedule?.courseDegreeGroup);
      tempSchedule.setCourseDegreeGroup(tempCourseDegreeGroup);
      
      const tempRoom = await repositoryRoom.findOne(schedule?.room);
      tempSchedule.setRoom(new Room(tempRoom?.name, tempRoom?.capacity, tempRoom?._id));

      const tempSchoolYear = await repositorySchoolYear.findOne(schedule?.schoolYear);
      tempSchedule.setSchoolYear(new SchoolYear(tempSchoolYear?.startDate, tempSchoolYear?.endDate, tempSchoolYear?.isActive, tempSchoolYear?._id));
      
      const tempHourInterval = await repositoryHourInterval.findOne(schedule?.hourInterval);
      tempSchedule.setHourInterval(new HourInterval(tempHourInterval?.start, tempHourInterval?.end, tempHourInterval?._id));

      tempScheduleArray.push(tempSchedule);
    }
    return tempScheduleArray;
  }

  async findAssignedScheduleByGroup(id: string): Promise<IScheduleResponse[]> {
    const tempScheduleArray: Schedule[] = [];
    const tempId: ObjectId = new ObjectId(id);
    
    // Declare repositories and services to get data
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositorySchedule = new RepositorySchedule(db, 'Schedule');
    const repositoryCourseDegreeGroup: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const serviceCourse: ServiceCourseDegreeGroup = new ServiceCourseDegreeGroup();
    const serviceHourInterval: ServiceHourInterval = new ServiceHourInterval();
    const repositoryRoom: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const repositorySchoolYear: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const repositoryHourInterval: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');

    const response = await repository.findAssignedScheduleByGroup(tempId);
    let tempSchedule: Schedule;
    // Change id of every property to its full model
    for await(let schedule of response) {
      tempSchedule =  new Schedule(schedule?.courseDegreeGroup, schedule?.room, schedule?.schoolYear, schedule?.hourInterval, schedule.day, schedule?._id);

      const tempCourseDegreeGroup: CourseDegreeGroup = await serviceCourse.findOne(schedule?.courseDegreeGroup);
      tempSchedule.setCourseDegreeGroup(tempCourseDegreeGroup);
      
      const tempRoom = await repositoryRoom.findOne(schedule?.room);
      tempSchedule.setRoom(new Room(tempRoom?.name, tempRoom?.capacity, tempRoom?._id));

      const tempSchoolYear = await repositorySchoolYear.findOne(schedule?.schoolYear);
      tempSchedule.setSchoolYear(new SchoolYear(tempSchoolYear?.startDate, tempSchoolYear?.endDate, tempSchoolYear?.isActive, tempSchoolYear?._id));
      
      const tempHourInterval = await repositoryHourInterval.findOne(schedule?.hourInterval);
      tempSchedule.setHourInterval(new HourInterval(tempHourInterval?.start, tempHourInterval?.end, tempHourInterval?._id));

      tempScheduleArray.push(tempSchedule);
    }
    const intervals: HourInterval[] = await serviceHourInterval.find();
    
    return this.treatData(tempScheduleArray, intervals);
  }

  async findAssignedScheduleByTeacher(id: string): Promise<IScheduleResponse[]> {
    const tempScheduleArray: Schedule[] = [];
    const tempId: ObjectId = new ObjectId(id);
    
    // Declare repositories and services to get data
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositorySchedule = new RepositorySchedule(db, 'Schedule');
    const repositoryCourseDegreeGroup: RepositoryCourseDegreeGroup = new RepositoryCourseDegreeGroup(db, 'CourseDegreeGroup');
    const serviceCourse: ServiceCourseDegreeGroup = new ServiceCourseDegreeGroup();
    const serviceHourInterval: ServiceHourInterval = new ServiceHourInterval();
    const repositoryRoom: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const repositorySchoolYear: RepositorySchoolYear = new RepositorySchoolYear(db, 'SchoolYear');
    const repositoryHourInterval: RepositoryHourInterval = new RepositoryHourInterval(db, 'HourInterval');
    const serviceTeacher: ServiceTeacher = new ServiceTeacher();

    const response = await repository.findAssignedScheduleByTeacher(tempId);
    let tempSchedule: Schedule;
    // Change id of every property to its full model
    for await(let schedule of response) {
      tempSchedule =  new Schedule(schedule?.courseDegreeGroup, schedule?.room, schedule?.schoolYear, schedule?.hourInterval, schedule.day, schedule?._id);

      const tempCourseDegreeGroup: CourseDegreeGroup = await serviceCourse.findOne(schedule?.courseDegreeGroup);
      tempSchedule.setCourseDegreeGroup(tempCourseDegreeGroup);
      
      const tempRoom = await repositoryRoom.findOne(schedule?.room);
      tempSchedule.setRoom(new Room(tempRoom?.name, tempRoom?.capacity, tempRoom?._id));

      const tempSchoolYear = await repositorySchoolYear.findOne(schedule?.schoolYear);
      tempSchedule.setSchoolYear(new SchoolYear(tempSchoolYear?.startDate, tempSchoolYear?.endDate, tempSchoolYear?.isActive, tempSchoolYear?._id));
      
      const tempHourInterval = await repositoryHourInterval.findOne(schedule?.hourInterval);
      tempSchedule.setHourInterval(new HourInterval(tempHourInterval?.start, tempHourInterval?.end, tempHourInterval?._id));

      tempScheduleArray.push(tempSchedule);
    }
    const intervals: HourInterval[] = await serviceHourInterval.find();
    const teacher: Teacher = await serviceTeacher.findOne(id);
    
    return this.setTeachersAvalibility(this.treatData(tempScheduleArray, intervals), [teacher],intervals);
  }

  

  private changeDayByName = {
    0: 'monday',
    1: 'tuesday',
    2: 'wednesday',
    3: 'thursday',
    4: 'friday',
    5: 'saturday',
    6: 'sunday',
  }
  // Function for the union of intervals in week days
  private treatData(data, intervals: HourInterval[]): IScheduleResponse[] {
    let tempData: IScheduleResponse[] = [];
    let tempIndex: number = -1;
    let temp: IScheduleResponse = {
      hourInterval: undefined, 
      monday: undefined, 
      tuesday: undefined, 
      wednesday: undefined, 
      thursday: undefined, 
      friday: undefined, 
      saturday: undefined, 
      sunday: undefined
    };
    // first we add the format days and interval with the database result if is not added before
    tempData = data.reduce((value, row) => {
      temp = {
        hourInterval: undefined, 
        monday: undefined, 
        tuesday: undefined, 
        wednesday: undefined, 
        thursday: undefined, 
        friday: undefined, 
        saturday: undefined, 
        sunday: undefined
      };
      let {hourInterval, day, ...values} : {hourInterval: HourInterval, day: number, values: any} = row;
      
      if (value.length === 0) {
        temp.hourInterval = hourInterval;
        temp[this.changeDayByName[day]] = {...values}
        value.push({...temp});
        return value;
      }
      tempIndex = value.findIndex((record) => {
        return record.hourInterval._id.toString() === hourInterval._id.toString()
       });
      if (tempIndex >= 0) {
        value[tempIndex][this.changeDayByName[day]] = {...values};
        return value;
      } 
        temp.hourInterval = hourInterval;
        temp[this.changeDayByName[day]] = {...values};
        value.push({...temp});
        
        return value;
      
    }, []);
    //then we add the every interval to the array if not in it 
    tempIndex = -1;
    let response: IScheduleResponse[] = [];
    intervals.forEach((interval) => {
      tempIndex = tempData.findIndex((row) => {
        return row.hourInterval._id.toString() === interval._id.toString()
      })
      if (tempIndex === -1) {
        response.push({
          hourInterval: interval,
          monday: undefined, 
          tuesday: undefined, 
          wednesday: undefined, 
          thursday: undefined, 
          friday: undefined, 
          saturday: undefined, 
          sunday: undefined
        })
      } else {
        response.push({...tempData[tempIndex], hourInterval: interval})
      }
    });
    return response;
  };
  // This function set busy Days an hours for teachers
  // Needs to be improved
  setTeachersAvalibility = (schedule, teachers, intervals) => {
    
    // Get intervals with days for busy days
    let tempDayInterval: IScheduleResponse = {
      hourInterval: undefined, 
      monday: undefined, 
      tuesday: undefined, 
      wednesday: undefined, 
      thursday: undefined, 
      friday: undefined, 
      saturday: undefined, 
      sunday: undefined
    };
    const tempTeachersIntervals = [];
    teachers.forEach((busyDays) => {
      
      busyDays.busyDays.forEach(day => {
        tempDayInterval = {
          hourInterval: undefined, 
          monday: undefined, 
          tuesday: undefined, 
          wednesday: undefined, 
          thursday: undefined, 
          friday: undefined, 
          saturday: undefined, 
          sunday: undefined
        };
        
        const tempValue = intervals.filter((interval) => {      
          return convertHourToMinutes(interval.start) >= day.start && convertHourToMinutes(interval.end) <= day.end
        });
        
        if (tempValue.length > 0) {
          tempDayInterval.hourInterval = {...tempValue[0]};
          tempDayInterval[this.changeDayByName[day.day]] = {occupied: true};
         }
        tempTeachersIntervals.push({...tempDayInterval});
      });
    });

    
    const joinIntervals = tempTeachersIntervals.reduce((acc, value) => {
      if (acc.length === 0) return [{...value}];
      const tempIndex = acc.findIndex((key) => key.hourInterval._id.toString() === value.hourInterval._id.toString());
      if (tempIndex !== -1) {
        if (value?.monday) {
          acc[tempIndex] = {...acc[tempIndex], monday: value.monday};
        } else if (value?.tuesday) {
          acc[tempIndex] = {...acc[tempIndex], tuesday: value.tuesday};
        } else if (value?.wednesday) {
          acc[tempIndex] = {...acc[tempIndex], wednesday: value.wednesday};
        } else if (value?.thursday) {
          acc[tempIndex] = {...acc[tempIndex], thursday: value.thursday};
        } else if (value?.friday) {
          acc[tempIndex] = {...acc[tempIndex], friday: value.friday};
        }
        return acc;
      }
      return [...acc, value];
    }, []);

    const tempSchedule = schedule.map((value) => {
      
      const intervalExistence = joinIntervals.filter((interval) => {
        
        return interval.hourInterval._id.toString() === value.hourInterval._id.toString();
      });
      if (intervalExistence.length > 0) {
        if (intervalExistence[0].monday) {
          value.monday = {...value.monday, occupied: intervalExistence[0].monday.occupied};
        }
        if (intervalExistence[0].tuesday) {
          value.tuesday = {...value.tuesday, occupied: intervalExistence[0].tuesday.occupied};
        }
        if (intervalExistence[0].wednesday) {
          value.wednesday = {...value.wednesday, occupied: intervalExistence[0].wednesday.occupied};
        }
        if (intervalExistence[0].thursday) {
          value.thursday = {...value.thursday, occupied: intervalExistence[0].thursday.occupied};
        }
        if (intervalExistence[0].friday) {
          value.friday = {...value.friday, occupied: intervalExistence[0].friday.occupied};
        }
      }
      return value;
    });
    return tempSchedule; 	
  };
}