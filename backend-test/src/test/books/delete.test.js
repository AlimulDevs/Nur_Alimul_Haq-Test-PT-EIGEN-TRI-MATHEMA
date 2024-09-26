import deleteBook from '../../controllers/books/delete.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        book: {
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('deleteBook', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete a book and return success', async () => {
        // Mock the request parameter
        req.params.id = '1';

        // Mock the Prisma Client methods
        prisma.book.findUnique.mockResolvedValue({ id: 1, title: 'Test Book' });
        prisma.book.delete.mockResolvedValue({ id: 1, title: 'Test Book' });

        await deleteBook(req, res);

        expect(prisma.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(prisma.book.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            is_success: true,
            message: 'success delete book',
            data: { id: 1, title: 'Test Book' },
        });
    });

    it('should return 400 if book not found', async () => {
        req.params.id = '1';
        prisma.book.findUnique.mockResolvedValue(null); // Simulate not finding the book

        await deleteBook(req, res);

        expect(prisma.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'book not found',
        });
    });

    it('should return 500 on internal server error', async () => {
        req.params.id = '1';
        prisma.book.findUnique.mockImplementation(() => {
            throw new Error('Database error');
        });

        await deleteBook(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'Internal server error',
        });
    });
});
