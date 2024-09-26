import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function getAllBooks(req, res) {
    try {
        const books = await prisma.book.findMany();
        res.status(200).json({
            status: 200,
            is_success: true,
            message: "success get all books",
            data: books
        });
    } catch (error) {
        res.status(500).json({

            is_success: false,
            message: "Internal server error"
        });
    }

}
