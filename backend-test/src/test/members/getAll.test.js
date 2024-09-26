import getAllMembers from '../../controllers/members/getAll.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        member: {
            findMany: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('getAllMembers', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {}; // No parameters needed for getAllMembers
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return all members successfully', async () => {
        const mockMembers = [
            { id: 1, code: 'M001', name: 'John Doe' },
            { id: 2, code: 'M002', name: 'Jane Smith' },
        ];

        // Mock the Prisma Client method to return mock members
        prisma.member.findMany.mockResolvedValue(mockMembers);

        await getAllMembers(req, res);

        expect(prisma.member.findMany).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            is_success: true,
            message: 'success get all members',
            data: mockMembers,
        });
    });

    it('should return 500 on internal server error', async () => {
        // Mock the Prisma Client method to throw an error
        prisma.member.findMany.mockImplementation(() => {
            throw new Error('Database error');
        });

        await getAllMembers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'Internal server error',
        });
    });
});
