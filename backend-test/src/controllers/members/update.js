import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function updateMember(req, res) {
    try {
        const { id } = req.params
        const { code, name } = req.body;
        const getMember = await prisma.member.findUnique({ where: { id: Number(id) } })
        if (!getMember) {
            return res.status(400).json({
                is_success: false,
                message: "member not found"
            })
        }

        const member = await prisma.member.update({
            where: {
                id: Number(id),
            },
            data: {
                code: code,
                name: name,
            }
        })
        res.json({

            is_success: true,
            message: "success update member",
            data: member
        });
    } catch (error) {

        res.status(500).json({
            is_success: false,
            message: "Internal server error"
        });
    }
}
