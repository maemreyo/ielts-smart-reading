import { notFound } from 'next/navigation';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { SelfLearningView } from '@/components/SelfLearningView';

// Force dynamic rendering for development
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    book: string;    // e.g., "17"
    test: string;    // e.g., "test-1"
    passage: string; // e.g., "1", "2", "3"
  }>;
}

async function getPassageData(book: string, test: string, passage: string) {
  try {
    const dataPath = join(process.cwd(), 'data', book, 'reading', test);

    // Read passage markdown file
    const passageFile = join(dataPath, `passage-${passage}.md`);
    const passageText = await readFile(passageFile, 'utf-8');

    // Read lexical data JSON file (optional for self-learning mode)
    const lexicalFile = join(dataPath, `${passage}__.json`);
    let lexicalData = null;

    try {
      lexicalData = JSON.parse(await readFile(lexicalFile, 'utf-8'));
    } catch {
      // Lexical data is optional for self-learning mode
      console.log('Lexical data not found, proceeding without it');
    }

    return {
      passageText,
      lexicalData,
      meta: {
        book,
        test: test.replace('test-', 'Test '),
        passage
      }
    };
  } catch (error) {
    console.error('Error loading passage data:', error);
    return null;
  }
}

export default async function SelfLearningPage({ params }: PageProps) {
  const resolvedParams = await params;

  // Debug logging
  console.log('SelfLearningPage params:', resolvedParams);
  console.log('Looking for files:', {
    passageFile: `data/${resolvedParams.book}/reading/${resolvedParams.test}/passage-${resolvedParams.passage}.md`,
    lexicalFile: `data/${resolvedParams.book}/reading/${resolvedParams.test}/${resolvedParams.passage}__.json`
  });

  const data = await getPassageData(resolvedParams.book, resolvedParams.test, resolvedParams.passage);

  if (!data) {
    console.log('Data not found, redirecting to 404');
    notFound();
  }

  // Extract title from first line
  const lines = data.passageText.split('\n');
  const title = lines.find(line => line.startsWith('##'))?.replace(/## /g, '').trim();

  // Process passage text into paragraphs (excluding title)
  const paragraphs = data.passageText
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.trim());

  return (
    <SelfLearningView
      title={title}
      paragraphs={paragraphs}
      book={resolvedParams.book}
      test={resolvedParams.test}
      passage={resolvedParams.passage}
    />
  );
}

// Generate static params for available passages only
export async function generateStaticParams() {
  const params: { book: string; test: string; passage: string }[] = [];

  try {
    const dataPath = join(process.cwd(), 'data');

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
              // Check for passages 1, 2, 3
              for (let passageNum = 1; passageNum <= 3; passageNum++) {
                const passageFile = join(testPath, `passage-${passageNum}.md`);

                try {
                  // Check if passage file exists (lexical data is optional)
                  await stat(passageFile);

                  params.push({
                    book,
                    test,
                    passage: passageNum.toString()
                  });
                } catch {
                  // Passage file doesn't exist, skip
                }
              }
            }
          }
        } catch {
          // Reading folder doesn't exist
        }
      }
    }
  } catch (error) {
    console.error('Error generating static params:', error);
    // Fallback to known working route
    params.push({ book: '17', test: 'test-1', passage: '1' });
  }

  return params;
}

// Generate metadata for each page
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getPassageData(resolvedParams.book, resolvedParams.test, resolvedParams.passage);

  if (!data) {
    return {
      title: 'Passage Not Found',
    };
  }

  // Extract title from the first line of the passage
  const lines = data.passageText.split('\n');
  const title = lines[0].replace(/## /g, '');

  return {
    title: `Learn by Myself: ${title} | Cambridge ${data.meta.book} ${data.meta.test} Passage ${data.meta.passage}`,
    description: `IELTS Reading self-learning mode - Create your own vocabulary highlights from Cambridge ${data.meta.book} ${data.meta.test} Passage ${data.meta.passage}`,
  };
}