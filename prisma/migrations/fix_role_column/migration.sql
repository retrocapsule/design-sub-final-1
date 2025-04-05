-- Improved fix for Role enum in PostgreSQL
DO $$ 
BEGIN
    -- Output diagnostic information
    RAISE NOTICE 'Starting Role enum fix...';
    
    -- Check if Role type exists with proper case sensitivity
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        BEGIN
            RAISE NOTICE 'Role enum does not exist, creating it...';
            CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Role enum already exists (caught in exception handler)';
        END;
    ELSE
        RAISE NOTICE 'Role enum already exists';
    END IF;

    -- Drop domain if exists (cleanup from previous attempts)
    BEGIN
        DROP DOMAIN IF EXISTS "Role_domain" CASCADE;
        RAISE NOTICE 'Dropped Role_domain if it existed';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping domain: %', SQLERRM;
    END;
    
    -- Create a temporary domain to help with the conversion
    BEGIN
        CREATE DOMAIN "Role_domain" AS TEXT
            CONSTRAINT role_values CHECK (VALUE IN ('USER', 'ADMIN'));
        RAISE NOTICE 'Created Role_domain';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Role_domain already exists';
    END;
    
    -- Check the current role column type
    RAISE NOTICE 'Checking current column type in User table...';
    
    -- Alter the column to use text temporarily if needed
    BEGIN
        ALTER TABLE "User" ALTER COLUMN "role" TYPE TEXT;
        RAISE NOTICE 'Changed role column to TEXT type';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error altering role column: %', SQLERRM;
    END;
    
    -- Make sure all values in the role column are valid
    UPDATE "User" SET "role" = 'USER' WHERE "role" IS NULL OR "role" NOT IN ('USER', 'ADMIN');
    RAISE NOTICE 'Updated any invalid role values to USER';
    
    -- Now convert to the domain (safer than direct to enum)
    BEGIN
        ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_domain";
        RAISE NOTICE 'Changed role column to Role_domain type';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error converting to domain: %', SQLERRM;
    END;
    
    -- Finally convert to the proper enum
    BEGIN
        ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::text::"Role";
        RAISE NOTICE 'Changed role column to Role enum type';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error converting to enum: %', SQLERRM;
    END;
    
    -- Make sure the default is set properly
    BEGIN
        ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER'::"Role";
        RAISE NOTICE 'Set default value for role column to USER';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error setting default: %', SQLERRM;
    END;
    
    -- Drop the temporary domain
    BEGIN
        DROP DOMAIN IF EXISTS "Role_domain";
        RAISE NOTICE 'Dropped temporary Role_domain';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping domain: %', SQLERRM;
    END;
    
    -- Create an index on role if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'User' AND indexname = 'User_role_idx'
    ) THEN
        CREATE INDEX "User_role_idx" ON "User" ("role");
        RAISE NOTICE 'Created index on role column';
    ELSE
        RAISE NOTICE 'Index on role column already exists';
    END IF;
    
    RAISE NOTICE 'Role enum fix completed successfully';
END $$; 