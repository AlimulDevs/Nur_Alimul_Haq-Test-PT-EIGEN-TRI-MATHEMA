import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function updateBook(req, res) {
    try {
        const { id } = req.params
        const { code, title, author, stock } = req.body;
        const getBook = await prisma.book.findUnique({ where: { id: Number(id) } })
        if (!getBook) {
            return res.status(400).json({
                is_success: false,
                message: "book not found"
            })
        }


        const book = await prisma.book.update({
            where: {
                id: Number(id),
            },
            data: {
                code: code,
                title: title,
                author: author,
                stock: stock,
            }
        })
        res.status(201).json({
            status: 201,
            is_success: true,
            message: "success update book",
            data: book
        });
    } catch (error) {
        res.status(500).json({

            is_success: false,
            message: "Internal server error"
        });
    }
}
