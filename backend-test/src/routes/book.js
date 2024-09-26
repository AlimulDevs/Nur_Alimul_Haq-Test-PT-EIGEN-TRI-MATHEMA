import express from 'express';
import getAllBooks from '../controllers/books/getAll.js';
import getBookById from '../controllers/books/getById.js';
import createBook from '../controllers/books/create.js';
import updateBook from '../controllers/books/update.js';
import deleteBook from '../controllers/books/delete.js';
const bookRouter = express.Router();


bookRouter.get("/", getAllBooks)
bookRouter.get("/:id", getBookById)
bookRouter.post("/", createBook)
bookRouter.put("/:id", updateBook)
bookRouter.delete("/:id", deleteBook)

export default bookRouter