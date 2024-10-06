require('./instrumentation');
import { AxiosRequestConfig } from 'axios';
import express, { Request, Response } from 'express'
import axios from 'axios';

const app = express()

app.use(express.json());

function delay(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

app.get('/trades', async (req: Request, res: Response) => {
  const ms = Math.random() * 1 * 1000
  await delay(ms)
  res.json({
    message: 'OK'
  });
});


app.post('/trades', async (req, res) => {
  console.log(req.body);
  const result = await sendRequest({
    url: 'http://localhost:3001/trade/execute',
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'post',
    data: req.body,
  })
  res.json(result);
});

app.use((req, res, next) => {
  res.set("x-trace-id", req.headers["x-trace-id"])
})


function sendRequest(options: AxiosRequestConfig) {
  console.log(options)
  return axios.request(options).then((res) => {
    console.log("got response ", res.data);
    return res.data;
  }).catch(err => {
    console.log("error ", err);
  })
}

app.listen(3000, function () {
  console.log('Application is running on port 3000!');
});


