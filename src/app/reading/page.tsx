import Link from 'next/link';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Clock,
  FileText,
  Highlighter,
  Search,
  Filter,
  TrendingUp,
  Star,
  BarChart3,
  Target,
  Sparkles
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

                  const { readFile } = require('fs/promises');
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

function StatsCard({ icon: Icon, label, value, trend }: {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                {trend}
              </p>
            )}
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DifficultyBadge({ difficulty }: { difficulty?: 'easy' | 'medium' | 'hard' }) {
  if (!difficulty) return null;

  const colors = {
    easy: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    hard: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <Badge variant="outline" className={colors[difficulty]}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
}

function PassageCard({ passage }: { passage: PassageInfo }) {
  return (
    <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="shrink-0">
            Passage {passage.passage}
          </Badge>
          <DifficultyBadge difficulty={passage.difficulty} />
        </div>
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {passage.title}
        </CardTitle>
        <CardDescription>
          Cambridge IELTS {passage.book} • {passage.test.replace('test-', 'Test ')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
          <span className="flex items-center gap-1.5">
            <FileText size={14} />
            <span className="font-medium">{passage.wordCount.toLocaleString()}</span> words
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            <span className="font-medium">{passage.readingTime}</span> min
          </span>
        </div>

        <div className="space-y-2">
          <Link
            href={`/reading/${passage.book}/${passage.test}/${passage.passage}`}
            className="block"
          >
            <div className="w-full text-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
              <BookOpen size={16} />
              Start Reading
            </div>
          </Link>

          <Link
            href={`/self-learning/${passage.book}/${passage.test}/${passage.passage}`}
            className="block"
          >
            <div className="w-full text-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
              <Sparkles size={16} />
              Self-Learning
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ReadingIndexPage() {
  const passages = await getAvailablePassages();
  const availablePassages = passages.filter(p => p.available);
  const unavailablePassages = passages.filter(p => !p.available);

  const totalWords = availablePassages.reduce((sum, p) => sum + p.wordCount, 0);
  const avgReadingTime = Math.ceil(availablePassages.reduce((sum, p) => sum + p.readingTime, 0) / availablePassages.length);

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

  const easyPassages = availablePassages.filter(p => p.difficulty === 'easy');
  const mediumPassages = availablePassages.filter(p => p.difficulty === 'medium');
  const hardPassages = availablePassages.filter(p => p.difficulty === 'hard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Sparkles size={16} />
            Enhanced Learning Experience
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            IELTS Reading Practice
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master IELTS Reading with lexical analysis, interactive features, and personalized learning paths
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-4 mb-12">
          <StatsCard
            icon={FileText}
            label="Total Passages"
            value={availablePassages.length}
            trend="+3 this week"
          />
          <StatsCard
            icon={BookOpen}
            label="Test Sets"
            value={Object.keys(groupedPassages).length}
          />
          <StatsCard
            icon={BarChart3}
            label="Total Words"
            value={totalWords.toLocaleString()}
          />
          <StatsCard
            icon={Clock}
            label="Avg. Reading Time"
            value={`${avgReadingTime} min`}
          />
        </div>

        {/* Filters & Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search passages by title or topic..."
              className="pl-10 h-11"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px] h-11">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Filter by book" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Books</SelectItem>
              {Array.from(new Set(availablePassages.map(p => p.book))).map(book => (
                <SelectItem key={book} value={book}>Cambridge {book}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px] h-11">
              <Target size={16} className="mr-2" />
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All ({availablePassages.length})</TabsTrigger>
            <TabsTrigger value="easy">Easy ({easyPassages.length})</TabsTrigger>
            <TabsTrigger value="medium">Medium ({mediumPassages.length})</TabsTrigger>
            <TabsTrigger value="hard">Hard ({hardPassages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            <div className="space-y-12">
              {Object.values(groupedPassages).map(({ book, test, passages }) => (
                <div key={`${book}-${test}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold">Cambridge IELTS {book}</h2>
                      <p className="text-muted-foreground mt-1">
                        {test.replace('test-', 'Test ')} • {passages.length} passages
                      </p>
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {passages.reduce((sum, p) => sum + p.readingTime, 0)} min total
                    </Badge>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {passages.map((passage) => (
                      <PassageCard key={`${book}-${test}-${passage.passage}`} passage={passage} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="easy" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {easyPassages.map((passage) => (
                <PassageCard key={`${passage.book}-${passage.test}-${passage.passage}`} passage={passage} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="medium" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mediumPassages.map((passage) => (
                <PassageCard key={`${passage.book}-${passage.test}-${passage.passage}`} passage={passage} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hard" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hardPassages.map((passage) => (
                <PassageCard key={`${passage.book}-${passage.test}-${passage.passage}`} passage={passage} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Coming Soon Section */}
        {unavailablePassages.length > 0 && (
          <div className="mt-16 pt-12 border-t">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-muted-foreground mb-2">Coming Soon</h2>
              <p className="text-muted-foreground">More passages are being prepared for you</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {unavailablePassages.slice(0, 6).map((passage) => (
                <Card key={`${passage.book}-${passage.test}-${passage.passage}`} className="opacity-60 grayscale">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">Passage {passage.passage}</Badge>
                      <Badge variant="secondary">Soon</Badge>
                    </div>
                    <CardTitle className="text-lg">{passage.title}</CardTitle>
                    <CardDescription>
                      Cambridge IELTS {passage.book} • {passage.test.replace('test-', 'Test ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-11 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                      Under Development
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}