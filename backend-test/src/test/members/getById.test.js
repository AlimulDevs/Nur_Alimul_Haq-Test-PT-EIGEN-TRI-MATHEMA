import getMemberById from '../../controllers/members/getById.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        member: {
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('getMemberById', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            params: { id: '1' }, // Example ID to test
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a member successfully', async () => {
        const mockMember = { id: 1, code: 'M001', name: 'John Doe' };

        // Mock the Prisma Client method to return the mock member
        prisma.member.findUnique.mockResolvedValue(mockMember);

        await getMemberById(req, res);

        expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            is_success: true,
            message: 'success get members by id',
            data: mockMember,
        });
    });

    it('should return 404 if member is not found', async () => {
        // Mock the Prisma Client method to return null
        prisma.member.findUnique.mockResolvedValue(null);

        await getMemberById(req, res);

        expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Member not found" });
    });

    it('should return 500 on internal server error', async () => {
        // Mock the Prisma Client method to throw an error
        prisma.member.findUnique.mockImplementation(() => {
            throw new Error('Database error');
        });

        await getMemberById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'Internal server error',
        });
    });
});
