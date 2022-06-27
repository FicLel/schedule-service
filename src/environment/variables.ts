import dotenv from 'dotenv';
dotenv.config();

type MongoDBCredential = {
  dbName: string;
  username: string,
  password: string;
  cluster: string;
}

export const PORT: number | string = process.env.PORT || 5001;

export const DB_CREDENTIALS: MongoDBCredential = {  
  dbName: process.env.MONGODB_DATABASE,
  username: process.env.MONGODB_USER,
  password: process.env.MONGODB_PASSWORD,
  cluster: `mongodb:${process.env.MONGODB_DOCKER_PORT}`, 
};

export default {
  PORT,
};
