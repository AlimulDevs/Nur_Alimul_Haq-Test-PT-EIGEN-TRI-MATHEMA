import createBorrow from '../../controllers/borrow/create.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        member: {
            findUnique: jest.fn(),
        },
        borrow: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
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

describe('createBorrow', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: { member_code: 'M001', book_code: 'B001' }, // Example data
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should borrow a book successfully', async () => {
        const mockMember = { id: 1, penalty_end: null };
        const mockBook = { id: 1, stock: 5 };

        // Mock responses for member and book
        prisma.member.findUnique.mockResolvedValue(mockMember);
        prisma.borrow.findMany.mockResolvedValue([]);
        prisma.book.findUnique.mockResolvedValue(mockBook);

        await createBorrow(req, res);

        expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { code: 'M001' } });
        expect(prisma.borrow.findMany).toHaveBeenCalledWith({ where: { member_id: 1, return_date: null } });
        expect(prisma.book.findUnique).toHaveBeenCalledWith({ where: { code: 'B001' } });
        expect(prisma.borrow.create).toHaveBeenCalledWith({
            data: {
                member_id: 1,
                book_id: 1,
            },
        });
        expect(prisma.book.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { stock: { decrement: 1 } },
        });
        expect(res.json).toHaveBeenCalledWith({ message: "Book borrowed successfully" });
    });

    it('should return 404 if member not found', async () => {
        prisma.member.findUnique.mockResolvedValue(null); // Member not found

        await createBorrow(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: "Member not found",
        });
    });

    it('should return 400 if member is penalized', async () => {
        const mockMember = { id: 1, penalty_end: new Date(Date.now() + 10000) }; // Penalized member

        prisma.member.findUnique.mockResolvedValue(mockMember);

        await createBorrow(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: "Member is penalized",
        });
    });

    it('should return 400 if member cannot borrow more than 2 books', async () => {
        const mockMember = { id: 1, penalty_end: null };
        const mockBorrowedBooks = [{ id: 1 }, { id: 2 }]; // Member already has 2 borrowed books

        prisma.member.findUnique.mockResolvedValue(mockMember);
        prisma.borrow.findMany.mockResolvedValue(mockBorrowedBooks);

        await createBorrow(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: "Member cannot borrow more than 2 books",
        });
    });

    it('should return 400 if book is not available', async () => {
        const mockMember = { id: 1, penalty_end: null };
        prisma.member.findUnique.mockResolvedValue(mockMember);
        prisma.borrow.findMany.mockResolvedValue([]);
        prisma.book.findUnique.mockResolvedValue(null); // Book not found

        await createBorrow(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: "Book not available",
        });
    });

    it('should return 500 on internal server error', async () => {
        prisma.member.findUnique.mockImplementation(() => {
            throw new Error('Database error');
        });

        await createBorrow(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: "Internal server error",
        });
    });
});
