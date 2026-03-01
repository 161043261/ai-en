-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('NOT_PAY', 'WAIT_BUYER_PAY', 'TRADE_CLOSED', 'TRADE_SUCCESS', 'TRADE_FINISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "wordNumber" INTEGER NOT NULL DEFAULT 0,
    "dayNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordBookRecord" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "isMaster" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WordBookRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordBook" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "phonetic" TEXT,
    "definition" TEXT,
    "translation" TEXT,
    "pos" TEXT,
    "collins" TEXT,
    "oxford" TEXT,
    "tag" TEXT,
    "bnc" TEXT,
    "frq" TEXT,
    "exchange" TEXT,
    "gk" BOOLEAN,
    "zk" BOOLEAN,
    "gre" BOOLEAN,
    "toefl" BOOLEAN,
    "ielts" BOOLEAN,
    "cet6" BOOLEAN,
    "cet4" BOOLEAN,
    "ky" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradeNo" TEXT,
    "outTradeNo" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tradeStatus" "TradeStatus" NOT NULL DEFAULT 'NOT_PAY',
    "sendPayTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "isPurchased" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentRecordId" TEXT,

    CONSTRAINT "CourseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "teacher" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "WordBookRecord_userId_wordId_key" ON "WordBookRecord"("userId", "wordId");

-- CreateIndex
CREATE INDEX "WordBook_word_idx" ON "WordBook"("word");

-- CreateIndex
CREATE INDEX "WordBook_tag_idx" ON "WordBook"("tag");

-- CreateIndex
CREATE INDEX "WordBook_word_tag_idx" ON "WordBook"("word", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_outTradeNo_key" ON "PaymentRecord"("outTradeNo");

-- CreateIndex
CREATE INDEX "PaymentRecord_tradeNo_idx" ON "PaymentRecord"("tradeNo");

-- CreateIndex
CREATE UNIQUE INDEX "CourseRecord_userId_courseId_key" ON "CourseRecord"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "WordBookRecord" ADD CONSTRAINT "WordBookRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordBookRecord" ADD CONSTRAINT "WordBookRecord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "WordBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRecord" ADD CONSTRAINT "CourseRecord_paymentRecordId_fkey" FOREIGN KEY ("paymentRecordId") REFERENCES "PaymentRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRecord" ADD CONSTRAINT "CourseRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRecord" ADD CONSTRAINT "CourseRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
