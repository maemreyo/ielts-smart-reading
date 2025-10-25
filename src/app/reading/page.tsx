import Link from 'next/link';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, FileText } from 'lucide-react';

interface PassageInfo {
  book: string;
  test: string;
  passage: string;
  title: string;
  wordCount: number;
  readingTime: number;
  available: boolean;
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
              // Check for passages 1, 2, 3
              for (let passageNum = 1; passageNum <= 3; passageNum++) {
                const passageFile = join(testPath, `passage-${passageNum}.md`);
                const lexicalFile = join(testPath, `${passageNum}__.json`);
                
                try {
                  // Check if both files exist
                  await stat(passageFile);
                  await stat(lexicalFile);
                  
                  // Read passage to get title and word count
                  const { readFile } = require('fs/promises');
                  const passageText = await readFile(passageFile, 'utf-8');
                  const lines = passageText.split('\n');
                  const title = lines[0].replace(/## /g, '');
                  const wordCount = passageText.split(/\s+/).length;
                  const readingTime = Math.ceil(wordCount / 200);
                  
                  passages.push({
                    book,
                    test,
                    passage: passageNum.toString(),
                    title,
                    wordCount,
                    readingTime,
                    available: true
                  });
                } catch {
                  // Files don't exist, add as unavailable
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
        } catch {
          // Reading folder doesn't exist
        }
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
  const availablePassages = passages.filter(p => p.available);
  const unavailablePassages = passages.filter(p => !p.available);
  
  // Group by book and test
  const groupedPassages = availablePassages.reduce((acc, passage) => {
    const key = `${passage.book}-${passage.test}`;
    if (!acc[key]) {
      acc[key] = {
        book: passage.book,
        test: passage.test,
        passages: []
      };
    }
    acc[key].passages.push(passage);
    return acc;
  }, {} as Record<string, { book: string; test: string; passages: PassageInfo[] }>);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">IELTS Reading Practice</h1>
        <p className="text-lg text-muted-foreground">
          Enhanced reading experience with lexical analysis and interactive features
        </p>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText size={16} />
            {availablePassages.length} passages available
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={16} />
            {Object.keys(groupedPassages).length} test sets
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {Object.values(groupedPassages).map(({ book, test, passages }) => (
          <div key={`${book}-${test}`}>
            <h2 className="text-2xl font-semibold mb-4">
              Cambridge IELTS {book} - {test.replace('test-', 'Test ')}
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {passages.map((passage) => (
                <Link
                  key={`${book}-${test}-${passage.passage}`}
                  href={`/reading/${book}/${test}/${passage.passage}`}
                  className="block transition-transform hover:scale-105"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">
                          {passage.title}
                        </CardTitle>
                        <Badge variant="secondary">
                          Passage {passage.passage}
                        </Badge>
                      </div>
                      <CardDescription>
                        Cambridge IELTS {book} • {test.replace('test-', 'Test ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText size={14} />
                          {passage.wordCount.toLocaleString()} words
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {passage.readingTime} min read
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {unavailablePassages.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            Coming Soon
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unavailablePassages.slice(0, 6).map((passage) => (
              <Card key={`${passage.book}-${passage.test}-${passage.passage}`} className="opacity-50">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {passage.title}
                  </CardTitle>
                  <CardDescription>
                    Cambridge IELTS {passage.book} • {passage.test.replace('test-', 'Test ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">Coming Soon</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}