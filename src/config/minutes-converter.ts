export const convertHourToMinutes = (hour: string): number => {
  const splitHours: string[] = hour.split(':');
  if (splitHours.length < 2 || splitHours.length > 2) return -1;
  const hours: number = parseInt(splitHours[0], 10);
  const minutes: number = parseInt(splitHours[1], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return -1;
  }
  return (hours * 60) + minutes; 
}

export const transformmMinutesToHours = (time: number): string => {
  
  const tempHours: number  = time / 60;
  const tempMinutes: number = time % 60;
   
  const hours: number = parseInt(tempHours.toString(), 10);
  const minutes: number = parseInt(tempMinutes.toString(), 10);
  if (hours < 0 || hours > 23 || minutes > 59 || minutes < 0) {
    return 'Hora invalida';
  } 

  return ''+hours+':'+minutes;
};