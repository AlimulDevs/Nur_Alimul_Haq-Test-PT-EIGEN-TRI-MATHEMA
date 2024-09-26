import { PrismaClient } from '@prisma/client';
import express from 'express';
import bookRouter from './src/routes/book.js';
import memberRouter from './src/routes/member.js';
import borrowRouter from './src/routes/borrow.js';

const app = express();



app.use(express.json());


app.use("/api/book", bookRouter)
app.use("/api/member", memberRouter)
app.use("/api/borrow", borrowRouter)





app.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});

export default app;
