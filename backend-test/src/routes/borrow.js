import express from 'express';
import createBorrow from '../controllers/borrow/create.js';
import returnBorrow from '../controllers/borrow/return.js';
import getAllBorrow from '../controllers/borrow/getAll.js';

const borrowRouter = express.Router();

borrowRouter.post("/create", createBorrow)
borrowRouter.post("/return", returnBorrow)
borrowRouter.get("/", getAllBorrow)



export default borrowRouter