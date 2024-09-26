import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function getMemberById(req, res) {
    try {
        const { id } = req.params;
        const member = await prisma.member.findUnique({ where: { id: Number(id) } });
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }
        res.status(200).json({

            is_success: true,
            message: "success get members by id",
            data: member
        });
    } catch (error) {
        res.status(500).json({

            is_success: false,
            message: "Internal server error"
        });
    }
}
