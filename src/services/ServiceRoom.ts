import { RepositoryRoom } from '../repositories/RepositoryRoom';
import { Room } from '../models/Room';
import { DbInstance } from '../config/db-connector';
import { DB_CREDENTIALS } from '../environment/variables';
import { ObjectId, MongoError,Db } from 'mongodb';
import { ServiceSchedule } from './ServiceSchedule';
import { IRequestVerifyAvailableRooms } from '../interfaces/IRequestVerifyAvailableRooms';
import { RepositorySchedule } from '../repositories/RepositorySchedule';

export class ServiceRoom {

  async create(name: string, capacity: number): Promise<Room> {
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const room: Room = new Room(name, capacity);
    const id: ObjectId = await reposotiry.create(room);
    
    room.setId(id);
    
    return room;
  }

  async update(id: string, name: string, capacity: number): Promise<Room> {
    const room: Room = new Room(name, capacity, new ObjectId(id));
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const reposotiry: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const response: boolean = await reposotiry.update(id, room);
    if (response) return room;
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const response = await repository.delete(tempObject);
    
    return response;
  }

  async find(): Promise<Room[]> {
    const tempRoom: Room[] = [];
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const response = await repository.find();
    response.forEach((room) => {
      tempRoom.push(new Room(room?.name, room?.capacity, room?._id));
    });
    return tempRoom;
  }

  async findOne(id: string): Promise<Room> {
    const tempObject: ObjectId = new ObjectId(id);
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    const repository: RepositoryRoom = new RepositoryRoom(db, 'Room');
    const response = await repository.findOne(tempObject);
    
    if (!response?._id || response?.id === null) {
      return null;
    }
    const tempRoom = new Room(response?.name, response?.capacity ,response?._id);
    
    return tempRoom;
  }

  async getAvailableRoomsForSchedule(request: IRequestVerifyAvailableRooms): Promise<Room[]> {
    // Prepare data
    const tempRoom: Room[] = [];
    const hourInterval: ObjectId = new ObjectId(request.hourInterval);
    const {day, quantity} = request;
    //database instance
    const db: Db  = (await DbInstance.getInstance(DB_CREDENTIALS)).db;
    // declaring repositories and database calls
    const scheduleRepository = new RepositorySchedule(db, 'Schedule');
    const roomRepository = new RepositoryRoom(db, 'Room')
    
    const roomsSchedule = await scheduleRepository.verifyRooOccupation(hourInterval, day);
    console.log(roomsSchedule)
    const roomsId = roomsSchedule.map((room) => room.room)
    console.log(roomsId)
    const avaialableRooms = await roomRepository.getAvailableRooms(roomsId ,quantity)
    // Validations and returns
    //console.log(' a ', avaialableRooms);
    avaialableRooms.forEach((room) => {
      tempRoom.push(new Room(room?.name, room?.capacity, room?._id));
    });
    return tempRoom;
    
  }

}