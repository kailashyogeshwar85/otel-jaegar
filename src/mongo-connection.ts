import { Db, MongoClient } from 'mongodb';

let client: Db;

export async function getDbInstance() {
  if (client) return client;

  client = (await MongoClient.connect("mongodb://localhost:27017")).db("otel");
  return client;
}
