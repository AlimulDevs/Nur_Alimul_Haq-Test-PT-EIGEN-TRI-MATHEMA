import getAllBorrow from '../../controllers/borrow/getAll.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        borrow: {
            findMany: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('getAllBorrow', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch all borrow records successfully', async () => {
        const mockData = [
            {
                id: 1,
                member: { id: 1, name: 'John Doe' },
                book: { id: 1, title: 'Book Title 1' },
            },
            {
                id: 2,
                member: { id: 2, name: 'Jane Doe' },
                book: { id: 2, title: 'Book Title 2' },
            },
        ];

        // Mock the response for findMany
        prisma.borrow.findMany.mockResolvedValue(mockData);

        await getAllBorrow(req, res);

        expect(prisma.borrow.findMany).toHaveBeenCalledWith({
            include: {
                member: true,
                book: true,
            },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            is_success: true,
            message: "success get all borrow",
            data: mockData,
        });
    });

    it('should return 500 on internal server error', async () => {
        prisma.borrow.findMany.mockImplementation(() => {
            throw new Error('Database error');
        });

        await getAllBorrow(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: "Internal server error",
        });
    });
});
