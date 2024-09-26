import returnBorrow from '../../controllers/borrow/return.js'; // Adjust the import according to your file structure
import { PrismaClient } from '@prisma/client';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        member: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        borrow: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        book: {
            update: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('returnBorrow', () => {
    let req;
    let res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a book successfully', async () => {
        req.body = { member_code: 'M001', book_code: 'B001' };

        const mockMember = { id: 1, code: 'M001' };
        const mockBorrow = {
            id: 1,
            member_id: 1,
            book_id: 1,
            borrow_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            return_date: null,
        };
        const mockBook = { id: 1, code: 'B001' };

        prisma.member.findUnique.mockResolvedValue(mockMember);
        prisma.borrow.findFirst.mockResolvedValue(mockBorrow);
        prisma.book.update.mockResolvedValue(mockBook);

        await returnBorrow(req, res);

        expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { code: 'M001' } });
        expect(prisma.borrow.findFirst).toHaveBeenCalledWith({
            where: { member_id: 1, book: { code: 'B001' }, return_date: null },
            include: { book: true },
        });
        expect(prisma.borrow.update).toHaveBeenCalledWith({
            where: { id: mockBorrow.id },
            data: { return_date: expect.any(Date) },
        });
        expect(prisma.book.update).toHaveBeenCalledWith({
            where: { id: mockBorrow.book_id },
            data: { stock: { increment: 1 } },
        });
        expect(res.json).toHaveBeenCalledWith({
            is_success: true,
            message: "Book returned successfully"
        });
    });

    it('should penalize the member if the book is returned late', async () => {
        req.body = { member_code: 'M001', book_code: 'B001' };

        const mockMember = { id: 1, code: 'M001' };
        const mockBorrow = {
            id: 1,
            member_id: 1,
            book_id: 1,
            borrow_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            return_date: null,
        };

        prisma.member.findUnique.mockResolvedValue(mockMember);
        prisma.borrow.findFirst.mockResolvedValue(mockBorrow);

        await returnBorrow(req, res);

        expect(prisma.member.update).toHaveBeenCalledWith({
            where: { id: mockMember.id },
            data: { penalty_end: expect.any(Date) },
        });
    });

    it('should return 404 if member not found', async () => {
        req.body = { member_code: 'M001', book_code: 'B001' };
        prisma.member.findUnique.mockResolvedValue(null);

        await returnBorrow(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Member not found" });
    });

    it('should return 400 if borrow record not found', async () => {
        req.body = { member_code: 'M001', book_code: 'B001' };

        const mockMember = { id: 1, code: 'M001' };
        prisma.member.findUnique.mockResolvedValue(mockMember);
        prisma.borrow.findFirst.mockResolvedValue(null);

        await returnBorrow(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: "This book was not borrowed by this member"
        });
    });

    it('should return 500 on internal server error', async () => {
        prisma.member.findUnique.mockImplementation(() => {
            throw new Error('Database error');
        });

        await returnBorrow(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            is_success: false,
            message: "Internal server error"
        });
    });
});
