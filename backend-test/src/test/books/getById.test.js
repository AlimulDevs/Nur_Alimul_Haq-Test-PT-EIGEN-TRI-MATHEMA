import getBookById from '../../controllers/books/getById.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        book: {
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('getBookById', () => {
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

    it('should return the book by ID successfully', async () => {
        req.params.id = '1';
        const mockBook = { id: 1, code: '123', title: 'Test Book', author: 'John Doe', stock: 10 };

        // Mock the Prisma Client method
        prisma.book.findUnique.mockResolvedValue(mockBook);

        await getBookById(req, res);

        expect(prisma.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.json).toHaveBeenCalledWith({
            status: 200,
            is_success: true,
            message: 'success get books by id',
            data: mockBook,
        });
    });

    it('should return 404 if the book is not found', async () => {
        req.params.id = '999'; // A non-existing ID

        // Mock the Prisma Client method to return null
        prisma.book.findUnique.mockResolvedValue(null);

        await getBookById(req, res);

        expect(prisma.book.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            status: 404,
            is_success: false,
            message: 'book not found',
        });
    });

    it('should return 500 on internal server error', async () => {
        req.params.id = '1';

        // Mock the Prisma Client method to throw an error
        prisma.book.findUnique.mockImplementation(() => {
            throw new Error('Database error');
        });

        await getBookById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'Internal server error',
        });
    });
});
