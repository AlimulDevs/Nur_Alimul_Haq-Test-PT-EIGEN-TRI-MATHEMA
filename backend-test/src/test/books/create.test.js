// src/test/books/createBook.test.js
import { PrismaClient } from '@prisma/client';
import createBook from '../../controllers/books/create.js'; // Ganti dengan path yang sesuai

// Membuat mock untuk PrismaClient
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        book: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();

describe('createBook', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Menghapus mock setelah setiap tes
    });

    it('should create a new book', async () => {
        const req = {
            body: {
                code: 'BOOK001',
                title: 'Test Book',
                author: 'Test Author',
                stock: 10,
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        prisma.book.findUnique.mockResolvedValue(null); // Tidak ada buku dengan kode tersebut
        prisma.book.create.mockResolvedValue(req.body); // Mengembalikan data buku yang dibuat

        await createBook(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            is_success: true,
            message: "success create new book",
            data: req.body,
        });
    });

    it('should return error if code already exists', async () => {
        const req = {
            body: {
                code: 'BOOK001',
                title: 'Test Book',
                author: 'Test Author',
                stock: 10,
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        prisma.book.findUnique.mockResolvedValue(req.body); // Simulasi ada buku dengan kode tersebut

        await createBook(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: 400,
            is_success: false,
            message: "code already exists"
        });
    });

    it('should return 500 on internal server error', async () => {
        const req = {
            body: {
                code: 'BOOK002',
                title: 'Another Test Book',
                author: 'Another Test Author',
                stock: 5,
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        prisma.book.findUnique.mockImplementationOnce(() => {
            throw new Error('Simulated error'); // Simulasi kesalahan
        });

        await createBook(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({

            is_success: false,
            message: "Internal server error"
        });
    });
});
