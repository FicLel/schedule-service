import {Db, MongoClient, MongoError} from 'mongodb'

// Connexion credentials type 
export type MongoDBCredential = {
    dbName: string;
    username: string,
    password: string;
    cluster: string;
}

// Singleton DBInstance Class 
export class DbInstance {
 private static _instance: DbInstance;
 private _database: Db;
 private _dbClient: MongoClient;

 private constructor() {};

 public static async getInstance(cred: Readonly<MongoDBCredential>): Promise<DbInstance> {
  if (this._instance) {
   return this._instance;
  }

  this._instance = new DbInstance();
  this._instance._dbClient = new MongoClient(`mongodb://${cred.username}:${cred.password}@${cred.cluster}/admin?retryWrites=true&w=majority`);
  try {
    await this._instance._dbClient.connect(); 
    this._instance._database = this._instance._dbClient.db(cred.dbName);

    return this._instance;
  } catch (exception: any) {
    console.log(exception);
    return exception;
  }
}
 get db(): Db {
  return DbInstance._instance._database;
 }
 get client(): MongoClient {
  return DbInstance._instance._dbClient;
 }
}

