import { Room } from '../models/Room';
import { SchoolYear } from '../models/SchoolYear';
import { CourseDegreeGroup } from '../models/CourseDegreeGroup';

export interface IScheduleResponseDay {
  courseDegreeGroup: CourseDegreeGroup | null | undefined;
  room: Room | null | undefined;
  schoolYear: SchoolYear | null | undefined;
}