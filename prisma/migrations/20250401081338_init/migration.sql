-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "assignedToId" TEXT,
    CONSTRAINT "DesignRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DesignRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DesignRequest" ("createdAt", "description", "dimensions", "fileFormat", "id", "priority", "projectType", "status", "title", "updatedAt", "userId") SELECT "createdAt", "description", "dimensions", "fileFormat", "id", "priority", "projectType", "status", "title", "updatedAt", "userId" FROM "DesignRequest";
DROP TABLE "DesignRequest";
ALTER TABLE "new_DesignRequest" RENAME TO "DesignRequest";
CREATE INDEX "DesignRequest_userId_idx" ON "DesignRequest"("userId");
CREATE INDEX "DesignRequest_assignedToId_idx" ON "DesignRequest"("assignedToId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
