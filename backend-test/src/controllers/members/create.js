import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function createMember(req, res) {
    try {
        const { code, name } = req.body;
        const getMember = await prisma.member.findUnique({ where: { code } });
        if (getMember) {
            return res.status(400).json({

                is_success: false,
                message: "code already exist"
            })
        }
        const member = await prisma.member.create({ data: { code, name } });
        res.status(201).json({
            is_success: true,
            message: "success create new member",
            data: member
        });
    } catch (error) {

        res.status(500).json({
            is_success: false,
            message: "Internal server error"
        });
    }
}
