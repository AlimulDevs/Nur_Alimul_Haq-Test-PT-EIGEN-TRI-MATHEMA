import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function createBorrow(req, res) {
    try {
        const { member_code, book_code } = req.body;

        const member = await prisma.member.findUnique({
            where: { code: member_code },
        });
        if (!member)
            return res.status(404).json({
                is_success: false,
                message: "Member not found",
            });

        if (member.penalty_end && new Date() < new Date(member.penalty_end)) {
            return res.status(400).json({
                is_success: false,
                message: "Member is penalized",
            });
        }

        const borrowedBooks = await prisma.borrow.findMany({
            where: { member_id: member.id, return_date: null },
        });
        if (borrowedBooks.length >= 2) {
            return res.status(400).json({
                is_success: false,
                message: "Member cannot borrow more than 2 books",
            });
        }

        const book = await prisma.book.findUnique({ where: { code: book_code } });
        if (!book || book.stock <= 0) {
            return res.status(400).json({
                is_success: false,
                message: "Book not available",
            });
        }

        await prisma.borrow.create({
            data: {
                member_id: member.id,
                book_id: book.id,
            },
        });

        await prisma.book.update({
            where: { id: book.id },
            data: { stock: { decrement: 1 } },
        });

        res.json({ message: "Book borrowed successfully" });
    } catch (error) {
        res.status(500).json({
            is_success: false,
            message: "Internal server error",
        });
    }
}
