require('./instrumentation');
import express, { Request, Response } from 'express'
import { getDbInstance } from './mongo-connection';
const app = express()


app.use((req, res, next) => {
  console.log(req.path, req.headers);
  next()
});

app.use(express.json());

app.post('/trade/execute', async (req: Request, res: Response) => {
  console.log("received request to execute trade!", req.body);
  console.log("sending response");
  const db = await getDbInstance();
  const result = await db.collection("trades").insertOne(req.body)
  res.json({
    result,
  });
});


app.listen(3001, () => {
  console.log('Application is listening in PORT: 3001');
});