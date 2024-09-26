import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function getAllBorrow(req, res) {
    try {
        const data = await prisma.borrow.findMany(
            {
                include: {
                    member: true,
                    book: true
                }
            }
        );

        return res.status(200).json({
            is_success: true,
            message: "success get all borrow",
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            is_success: false,
            message: "Internal server error"
        })
    }

}
