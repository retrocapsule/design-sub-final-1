-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 