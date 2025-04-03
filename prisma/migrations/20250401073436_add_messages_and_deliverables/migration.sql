/*
  Warnings:

  - You are about to drop the `DesignFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `message` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `DesignRequest` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `isFromAdmin` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `recipientId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `content` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Made the column `dimensions` on table `DesignRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fileFormat` on table `DesignRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priority` on table `DesignRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `projectType` on table `DesignRequest` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DesignFile";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "designRequestId" TEXT NOT NULL,
    CONSTRAINT "Deliverable_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "DesignRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "designRequestId" TEXT NOT NULL,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "DesignRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("createdAt", "designRequestId", "id", "userId") SELECT "createdAt", "designRequestId", "id", "userId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "Comment_designRequestId_idx" ON "Comment"("designRequestId");
CREATE TABLE "new_DesignRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "fileFormat" TEXT NOT NULL,
    "dimensions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "DesignRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DesignRequest" ("createdAt", "description", "dimensions", "fileFormat", "id", "priority", "projectType", "status", "title", "updatedAt", "userId") SELECT "createdAt", "description", "dimensions", "fileFormat", "id", "priority", "projectType", "status", "title", "updatedAt", "userId" FROM "DesignRequest";
DROP TABLE "DesignRequest";
ALTER TABLE "new_DesignRequest" RENAME TO "DesignRequest";
CREATE INDEX "DesignRequest_userId_idx" ON "DesignRequest"("userId");
CREATE TABLE "new_File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "designRequestId" TEXT NOT NULL,
    CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "File_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "DesignRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_File" ("createdAt", "designRequestId", "id", "name", "url", "userId") SELECT "createdAt", "designRequestId", "id", "name", "url", "userId" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE INDEX "File_userId_idx" ON "File"("userId");
CREATE INDEX "File_designRequestId_idx" ON "File"("designRequestId");
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "designRequestId" TEXT NOT NULL,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "DesignRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("content", "createdAt", "designRequestId", "id", "updatedAt") SELECT "content", "createdAt", "designRequestId", "id", "updatedAt" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_userId_idx" ON "Message"("userId");
CREATE INDEX "Message_designRequestId_idx" ON "Message"("designRequestId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "onboardingStep" TEXT DEFAULT 'profile',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "onboardingCompleted", "onboardingStep", "password", "role", "stripeCustomerId", "subscriptionId", "subscriptionStatus", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "onboardingCompleted", "onboardingStep", "password", "role", "stripeCustomerId", "subscriptionId", "subscriptionStatus", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Deliverable_designRequestId_idx" ON "Deliverable"("designRequestId");
