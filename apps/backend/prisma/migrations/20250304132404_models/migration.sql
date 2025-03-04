-- CreateTable
CREATE TABLE "ModelJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT NOT NULL,
    "modelUrl" TEXT,
    "statusUrl" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelJob_userId_idx" ON "ModelJob"("userId");

-- AddForeignKey
ALTER TABLE "ModelJob" ADD CONSTRAINT "ModelJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
