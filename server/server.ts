import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors'
const app = express();
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth.js';


const port = 3000;

const corsOptions = {
    origin : process.env.TRUSTED_ORIGINS?.split(',') || [],
    credentials : true,
}

console.log(process.env.TRUSTED_ORIGINS);

app.use(cors(corsOptions));

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
