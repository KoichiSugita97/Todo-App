// src/lib/db.ts
import 'dotenv/config';
console.log('DATABASE_URL=', process.env.DATABASE_URL);
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export default prisma;
