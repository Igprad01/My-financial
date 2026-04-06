import { PrismaClient } from "@prisma/client";

const prismaGlobal = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = prismaGlobal.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prisma;
}
