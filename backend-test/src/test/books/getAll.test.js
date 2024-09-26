import getAllBooks from '../../controllers/books/getAll.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        book: {
            findMany: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('getAllBooks', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {}; // No body or params needed for this endpoint
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return all books successfully', async () => {
        const mockBooks = [
            { code: "JK-45", title: "Harry Potter", author: "J.K Rowling", stock: 1 },
            { code: "SHR-1", title: "A Study in Scarlet", author: "Arthur Conan Doyle", stock: 1 },
            { code: "TW-11", title: "Twilight", author: "Stephenie Meyer", stock: 1 },
            { code: "HOB-83", title: "The Hobbit, or There and Back Again", author: "J.R.R. Tolkien", stock: 1 },
            { code: "NRN-7", title: "The Lion, the Witch and the Wardrobe", author: "C.S. Lewis", stock: 1 },
        ];

        // Mock the Prisma Client method
        prisma.book.findMany.mockResolvedValue(mockBooks);

        await getAllBooks(req, res);

        expect(prisma.book.findMany).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: 200,
            is_success: true,
            message: 'success get all books',
            data: mockBooks,
        });
    });

    it('should return 500 on internal server error', async () => {
        // Mock the Prisma Client method to throw an error
        prisma.book.findMany.mockImplementation(() => {
            throw new Error('Database error');
        });

        await getAllBooks(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: 'Internal server error',
        });
    });
});
