import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function deleteBook(req, res) {
    try {
        const { id } = req.params
        const getBook = await prisma.book.findUnique({ where: { id: Number(id) } })
        if (!getBook) {
            return res.status(400).json({
                is_success: false,
                message: "book not found"
            })
        }


        const book = await prisma.book.delete({
            where: {
                id: Number(id),
            },

        })
        res.status(201).json({
            is_success: true,
            message: "success delete book",
            data: book
        });
    } catch (error) {
        res.status(500).json({
            is_success: false,
            message: "Internal server error"
        });
    }

}
