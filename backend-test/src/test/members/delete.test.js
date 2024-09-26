import deleteMember from '../../controllers/members/delete.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';


// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        member: {
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('deleteMember', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete a member successfully', async () => {
        req.params.id = '1'; // Simulating a request with member ID 1

        const mockMember = { id: 1, code: 'M001', name: 'John Doe' };

        // Mock the Prisma Client methods
        prisma.member.findUnique.mockResolvedValue(mockMember); // Simulate that the member exists
        prisma.member.delete.mockResolvedValue(mockMember); // Simulate the deletion of the member

        await deleteMember(req, res);

        expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(prisma.member.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            is_success: true,
            message: 'success delete member',
            data: mockMember,
        });
    });

    it('should return 400 if the member is not found', async () => {
        req.params.id = '1';

        // Mock the Prisma Client method to return null
        prisma.member.findUnique.mockResolvedValue(null); // Simulate that no member exists

        await deleteMember(req, res);

        expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'member not found',
        });
    });

    it('should return 500 on internal server error', async () => {
        req.params.id = '1';

        // Mock the Prisma Client method to throw an error
        prisma.member.findUnique.mockImplementation(() => {
            throw new Error('Database error');
        });

        await deleteMember(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'Internal server error',
        });
    });
});
