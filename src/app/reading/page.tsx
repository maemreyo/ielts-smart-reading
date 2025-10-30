import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import ReadingIndexClient from './ReadingIndexClient';

interface PassageInfo {
  book: string;
  test: string;
  passage: string;
  title: string;
  wordCount: number;
  readingTime: number;
  available: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

async function getAvailablePassages(): Promise<PassageInfo[]> {
  const passages: PassageInfo[] = [];
  const dataPath = join(process.cwd(), 'data');

  try {
    const books = await readdir(dataPath);

    for (const book of books) {
      const bookPath = join(dataPath, book);
      const bookStat = await stat(bookPath);

      if (bookStat.isDirectory()) {
        const readingPath = join(bookPath, 'reading');

        try {
          const tests = await readdir(readingPath);

          for (const test of tests) {
            const testPath = join(readingPath, test);
            const testStat = await stat(testPath);

            if (testStat.isDirectory()) {
              for (let passageNum = 1; passageNum <= 3; passageNum++) {
                const passageFile = join(testPath, `passage-${passageNum}.md`);
                const lexicalFile = join(testPath, `${passageNum}__.json`);

                try {
                  await stat(passageFile);
                  await stat(lexicalFile);

                  const passageText = await readFile(passageFile, 'utf-8');
                  const lines = passageText.split('\n');
                  const title = lines[0].replace(/## /g, '');
                  const wordCount = passageText.split(/\s+/).length;
                  const readingTime = Math.ceil(wordCount / 200);

                  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
                  if (passageNum === 1 || wordCount < 700) difficulty = 'easy';
                  else if (passageNum === 3 || wordCount > 900) difficulty = 'hard';

                  passages.push({
                    book,
                    test,
                    passage: passageNum.toString(),
                    title,
                    wordCount,
                    readingTime,
                    available: true,
                    difficulty
                  });
                } catch {
                  passages.push({
                    book,
                    test,
                    passage: passageNum.toString(),
                    title: `Passage ${passageNum}`,
                    wordCount: 0,
                    readingTime: 0,
                    available: false
                  });
                }
              }
            }
          }
        } catch { }
      }
    }
  } catch (error) {
    console.error('Error scanning passages:', error);
  }

  return passages.sort((a, b) => {
    if (a.book !== b.book) return a.book.localeCompare(b.book);
    if (a.test !== b.test) return a.test.localeCompare(b.test);
    return a.passage.localeCompare(b.passage);
  });
}

export default async function ReadingIndexPage() {
  const passages = await getAvailablePassages();

  return <ReadingIndexClient initialPassages={passages} />;
}
