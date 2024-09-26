import updateBook from '../../controllers/books/update.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        book: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('updateBook', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            params: {},
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

    it('should update the book successfully', async () => {
        req.params.id = '1';
        req.body = { code: '123', title: 'Updated Book', author: 'John Doe', stock: 15 };

        const mockBook = { id: 1, code: '123', title: 'Updated Book', author: 'John Doe', stock: 15 };

        // Mock the Prisma Client methods
        prisma.book.findUnique.mockResolvedValue(mockBook); // Simulate finding the book
        prisma.book.update.mockResolvedValue(mockBook); // Simulate updating the book

        await updateBook(req, res);

        expect(prisma.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(prisma.book.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                code: '123',
                title: 'Updated Book',
                author: 'John Doe',
                stock: 15,
            },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            status: 201,
            is_success: true,
            message: 'success update book',
            data: mockBook,
        });
    });

    it('should return 400 if the book is not found', async () => {
        req.params.id = '999'; // A non-existing ID

        // Mock the Prisma Client method to return null
        prisma.book.findUnique.mockResolvedValue(null);

        await updateBook(req, res);

        expect(prisma.book.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'book not found',
        });
    });

    it('should return 500 on internal server error', async () => {
        req.params.id = '1';
        req.body = { code: '123', title: 'Updated Book', author: 'John Doe', stock: 15 };

        // Mock the Prisma Client method to throw an error
        prisma.book.findUnique.mockImplementation(() => {
            throw new Error('Database error');
        });

        await updateBook(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'Internal server error',
        });
    });
});
