import createMember from '../../controllers/members/create.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        member: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('createMember', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a member successfully', async () => {
        req.body = { code: 'M001', name: 'John Doe' };

        const mockMember = { id: 1, code: 'M001', name: 'John Doe' };

        // Mock the Prisma Client methods
        prisma.member.findUnique.mockResolvedValue(null); // Simulate that no member exists
        prisma.member.create.mockResolvedValue(mockMember); // Simulate creating the member

        await createMember(req, res);

        expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { code: 'M001' } });
        expect(prisma.member.create).toHaveBeenCalledWith({ data: { code: 'M001', name: 'John Doe' } });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            is_success: true,
            message: 'success create new member',
            data: mockMember,
        });
    });

    it('should return 400 if the member code already exists', async () => {
        req.body = { code: 'M001', name: 'John Doe' };

        // Mock the Prisma Client method to return an existing member
        prisma.member.findUnique.mockResolvedValue({ id: 1, code: 'M001', name: 'John Doe' });

        await createMember(req, res);

        expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { code: 'M001' } });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'code already exist',
        });
    });

    it('should return 500 on internal server error', async () => {
        req.body = { code: 'M001', name: 'John Doe' };

        // Mock the Prisma Client method to throw an error
        prisma.member.findUnique.mockImplementation(() => {
            throw new Error('Database error');
        });

        await createMember(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'Internal server error',
        });
    });
});
