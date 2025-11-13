import { PrismaClient } from "@/generated/prisma/client"; // Your custom path

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// 1. Tell TypeScript that the global object has a property named 'prisma'
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 2. Now TypeScript knows 'globalThis.prisma' exists
const prisma = globalThis.prisma ?? prismaClientSingleton();

export const db = prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
