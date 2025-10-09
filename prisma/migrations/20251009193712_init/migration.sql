-- CreateEnum
CREATE TYPE "CollateralType" AS ENUM ('SOL', 'jitoSOL', 'mSOL', 'bSOL');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('OPEN_POSITION', 'ADJUST_POSITION', 'CLOSE_POSITION', 'LIQUIDATION', 'REDEMPTION');

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "collateralType" "CollateralType" NOT NULL,
    "collateralAmount" DOUBLE PRECISION NOT NULL,
    "debt" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "positionId" TEXT,
    "owner" TEXT NOT NULL,
    "collateralType" "CollateralType",
    "collateralAmount" DOUBLE PRECISION,
    "collateralAdded" DOUBLE PRECISION,
    "borrowAmount" DOUBLE PRECISION,
    "debtRepaid" DOUBLE PRECISION,
    "fee" DOUBLE PRECISION,
    "liquidator" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtocolStats" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalCollateralSOL" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCollateralJitoSOL" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCollateralMSOL" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCollateralBSOL" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDebt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vUSDSupply" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activePositions" INTEGER NOT NULL DEFAULT 0,
    "baseRate" DOUBLE PRECISION NOT NULL DEFAULT 0.5,

    CONSTRAINT "ProtocolStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solPrice" DOUBLE PRECISION NOT NULL,
    "jitoSOLPrice" DOUBLE PRECISION,
    "mSOLPrice" DOUBLE PRECISION,
    "bSOLPrice" DOUBLE PRECISION,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Position_pubkey_key" ON "Position"("pubkey");

-- CreateIndex
CREATE INDEX "Position_owner_idx" ON "Position"("owner");

-- CreateIndex
CREATE INDEX "Position_collateralType_idx" ON "Position"("collateralType");

-- CreateIndex
CREATE INDEX "Position_closedAt_idx" ON "Position"("closedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_signature_key" ON "Transaction"("signature");

-- CreateIndex
CREATE INDEX "Transaction_owner_idx" ON "Transaction"("owner");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_timestamp_idx" ON "Transaction"("timestamp");

-- CreateIndex
CREATE INDEX "ProtocolStats_timestamp_idx" ON "ProtocolStats"("timestamp");

-- CreateIndex
CREATE INDEX "PriceHistory_timestamp_idx" ON "PriceHistory"("timestamp");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
