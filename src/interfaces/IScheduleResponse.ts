import { HourInterval } from '../models/HourInterval';
import { IScheduleResponseDay } from './IScheduleResponseDay';

export interface IScheduleResponse {
  hourInterval: HourInterval;
  monday: IScheduleResponseDay  | null | undefined;
  tuesday: IScheduleResponseDay  | null | undefined;
  wednesday: IScheduleResponseDay  | null | undefined;
  thursday: IScheduleResponseDay  | null | undefined;
  friday: IScheduleResponseDay  | null | undefined;
  saturday: IScheduleResponseDay  | null | undefined;
  sunday: IScheduleResponseDay | null | undefined
}