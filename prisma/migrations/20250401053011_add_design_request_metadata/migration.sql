-- AlterTable
ALTER TABLE "DesignRequest" ADD COLUMN "dimensions" TEXT;
ALTER TABLE "DesignRequest" ADD COLUMN "feedback" TEXT;
ALTER TABLE "DesignRequest" ADD COLUMN "fileFormat" TEXT;
ALTER TABLE "DesignRequest" ADD COLUMN "priority" TEXT;
ALTER TABLE "DesignRequest" ADD COLUMN "projectType" TEXT;

-- CreateTable
CREATE TABLE "DesignFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "designRequestId" TEXT NOT NULL,
    CONSTRAINT "DesignFile_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "DesignRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "designRequestId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT,
    "isFromAdmin" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Message_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "DesignRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
