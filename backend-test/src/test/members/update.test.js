import updateMember from '../../controllers/members/update.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';


// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        member: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('updateMember', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            params: { id: '1' }, // Example ID to test
            body: { code: 'M001', name: 'John Doe' }, // Example update data
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update a member successfully', async () => {
        const mockMember = { id: 1, code: 'M001', name: 'John Doe' };

        // Mock the Prisma Client methods to return a member and simulate an update
        prisma.member.findUnique.mockResolvedValue(mockMember);
        prisma.member.update.mockResolvedValue({ ...mockMember, name: 'Jane Doe' });

        await updateMember(req, res);

        expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(prisma.member.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { code: 'M001', name: 'John Doe' },
        });
        expect(res.json).toHaveBeenCalledWith({
            is_success: true,
            message: 'success update member',
            data: { ...mockMember, name: 'Jane Doe' },
        });
    });

    it('should return 400 if member is not found', async () => {
        // Mock the Prisma Client method to return null
        prisma.member.findUnique.mockResolvedValue(null);

        await updateMember(req, res);

        expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'member not found',
        });
    });

    it('should return 500 on internal server error', async () => {
        // Mock the Prisma Client method to throw an error
        prisma.member.findUnique.mockImplementation(() => {
            throw new Error('Database error');
        });

        await updateMember(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'Internal server error',
        });
    });
});
