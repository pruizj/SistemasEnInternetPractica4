import { Db, MongoClient } from "mongodb";
const config = require('./config.js');

export const connectDB = async (): Promise<Db> => {
  const mongouri: string = `mongodb+srv://${config.usr}:${config.pwd}@cluster-nebrija.fombo.mongodb.net/${config.dbName}?retryWrites=true&w=majority`;

  const client = new MongoClient(mongouri);

  try {
    await client.connect();
    console.info("MongoDB connected");

    return client.db(config.dbName);
  } catch (e) {
    throw e;
  }
};