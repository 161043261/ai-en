import { PrismaClient } from '@libs/shared/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

function parseCsvLine(line: string) {
  const res: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      res.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  res.push(cur);
  return res;
}

function parseTagToBoolean(tagValue: string) {
  const tags = tagValue
    ? tagValue.split(' ').filter((t) => t.trim() !== '')
    : [];
  return {
    zk: tags.includes('zk'),
    gk: tags.includes('gk'),
    cet4: tags.includes('cet4'),
    cet6: tags.includes('cet6'),
    ky: tags.includes('ky'),
    toefl: tags.includes('toefl'),
    ielts: tags.includes('ielts'),
    gre: tags.includes('gre'),
  };
}

export async function readLargeCsv(filepath: string) {
  const BATCH_SIZE = 2000;
  let lineCnt = 0;
  let headers: string[] = [];
  let batch: {
    zk: boolean;
    gk: boolean;
    cet4: boolean;
    cet6: boolean;
    ky: boolean;
    toefl: boolean;
    ielts: boolean;
    gre: boolean;
    word: string;
    phonetic: string | null;
    definition: string | null;
    translation: string | null;
    pos: string | null;
    collins: string | null;
    oxford: string | null;
    tag: string | null;
    bnc: string | null;
    frq: string | null;
    exchange: string | null;
  }[] = [];
  let totalInserted = 0;
  try {
    const fileStream = createReadStream(filepath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    for await (const line of rl) {
      lineCnt++;
      if (lineCnt === 1) {
        headers = line.split(',');
        continue;
      }
      const values = parseCsvLine(line);
      const rowData: {
        [key in (typeof headers)[number]]: string;
      } = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] ?? '';
      });
      const booleanFields = parseTagToBoolean(rowData.tag);
      const wordData = {
        ...booleanFields,
        word: rowData.word || '',
        phonetic: rowData.phonetic || null,
        definition: rowData.definition || null,
        translation: rowData.translation || null,
        pos: rowData.pos || null,
        collins: rowData.collins || null,
        oxford: rowData.oxford || null,
        tag: rowData.tag || null,
        bnc: rowData.bnc || null,
        frq: rowData.frq || null,
        exchange: rowData.exchange || null,
      };
      batch.push(wordData);
      if (batch.length >= BATCH_SIZE) {
        await prisma.wordBook.createMany({
          data: batch,
          skipDuplicates: true,
        });
        totalInserted += batch.length;
        batch = [];
      }
    }
    if (batch.length > 0) {
      await prisma.wordBook.createMany({
        data: batch,
        skipDuplicates: true,
      });
      totalInserted += batch.length;
    }
    console.log(
      `Processed ${(lineCnt - 1).toLocaleString()} lines. Inserted ${totalInserted.toLocaleString()} records`,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error:', errorMessage);
    throw new Error(`Failed to insert records: ${errorMessage}`);
  } finally {
    await prisma.$disconnect();
  }
}
