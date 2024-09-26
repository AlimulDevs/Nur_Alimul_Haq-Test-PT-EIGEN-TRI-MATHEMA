import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function getBookById(req, res) {
    try {
        const { id } = req.params;
        const book = await prisma.book.findUnique({ where: { id: Number(id) } });
        if (!book) {
            return res.status(404).json({
                status: 404,
                is_success: false,
                message: "book not found"
            });
        }
        res.json({
            status: 200,
            is_success: true,
            message: "success get books by id",
            data: book
        });
    } catch (error) {
        res.status(500).json({

            is_success: false,
            message: "Internal server error"
        });
    }

}
