-- CreateTable
CREATE TABLE "DesignTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "fileFormat" TEXT NOT NULL,
    "dimensions" TEXT NOT NULL,
    "defaultDescription" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DesignTemplate_name_key" ON "DesignTemplate"("name");
