-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "designRequestId" TEXT NOT NULL,
    "recipientId" TEXT,
    "isFromAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Message_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "DesignRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("content", "createdAt", "designRequestId", "id", "updatedAt", "userId") SELECT "content", "createdAt", "designRequestId", "id", "updatedAt", "userId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_userId_idx" ON "Message"("userId");
CREATE INDEX "Message_recipientId_idx" ON "Message"("recipientId");
CREATE INDEX "Message_designRequestId_idx" ON "Message"("designRequestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
