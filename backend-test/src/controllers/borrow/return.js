import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function returnBorrow(req, res) {
    try {
        const { member_code, book_code } = req.body;


        const member = await prisma.member.findUnique({ where: { code: member_code } });
        if (!member) return res.status(404).json({ message: "Member not found" });


        const borrow = await prisma.borrow.findFirst({
            where: { member_id: member.id, book: { code: book_code }, return_date: null },
            include: { book: true }
        });
        if (!borrow) {
            return res.status(400).json({
                is_success: false,
                message: "This book was not borrowed by this member"
            });
        }


        const borrow_date = new Date(borrow.borrow_date);
        const return_date = new Date();
        const diffTime = Math.abs(return_date - borrow_date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        console.log(diffDays)

        if (diffDays > 7) {
            const penalty_end = new Date();
            penalty_end.setDate(penalty_end.getDate() + 3);
            await prisma.member.update({
                where: { id: member.id },
                data: { penalty_end }
            });
        }


        await prisma.borrow.update({
            where: { id: borrow.id },
            data: { return_date }
        });

        await prisma.book.update({
            where: { id: borrow.book_id },
            data: { stock: { increment: 1 } }
        });

        res.json({
            is_success: true,
            message: "Book returned successfully"
        });
    } catch (error) {
        res.status(500).json({
            is_success: false,
            message: "Internal server error"
        });
    }
}
