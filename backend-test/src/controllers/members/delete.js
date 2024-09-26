import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function deleteMember(req, res) {
    try {
        const { id } = req.params

        const getMember = await prisma.member.findUnique({ where: { id: Number(id) } })
        if (!getMember) {
            return res.status(400).json({

                is_success: false,
                message: "member not found"
            })
        }


        const member = await prisma.member.delete({
            where: {
                id: Number(id),
            },

        })
        res.status(201).json({
            is_success: true,
            message: "success delete member",
            data: member
        });
    } catch (error) {

        res.status(500).json({
            is_success: false,
            message: "Internal server error"
        });
    }
}
