import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function getAllMembers(req, res) {
    try {
        const members = await prisma.member.findMany();
        res.status(200).json({
            is_success: true,
            message: "success get all members",
            data: members
        });
    } catch (error) {
        res.status(500).json({
            is_success: false,
            message: "Internal server error"
        });
    }
}
