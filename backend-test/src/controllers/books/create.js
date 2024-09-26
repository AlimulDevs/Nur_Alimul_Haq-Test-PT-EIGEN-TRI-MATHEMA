import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function createBook(req, res) {

    try {
        const { code, title, author, stock } = req.body;
        const getBook = await prisma.book.findUnique({ where: { code } });
        if (getBook) {
            return res.status(400).json({
                status: 400,
                is_success: false,
                message: "code already exists"
            });
        }

        const book = await prisma.book.create({ data: { code, title, author, stock } });
        res.status(201).json({
            is_success: true,
            message: "success create new book",
            data: book
        });
    } catch (error) {
        res.status(500).json({
            is_success: false,
            message: "Internal server error"
        });
    }
}
