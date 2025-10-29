"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpeechPlayer, EnglishSpeechPlayer, VietnameseSpeechPlayer, CompactSpeechPlayer } from '@/components/ui/speech-player';
import { LexicalItem } from '@/components/lexical-item';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Settings, PlayCircle } from 'lucide-react';

// Sample lexical data for testing
const sampleLexicalItem = {
  id: 1,
  targetLexeme: "increasingly threatened",
  sourceContext: "Polar bears are increasingly threatened by the effects of climate change.",
  phase1Inference: {
    contextualGuessVI: "bị đe dọa ngày càng tăng",
  },
  phase2Annotation: {
    phonetic: "/ɪnˈkriːsɪŋli ˈθretənd/",
    sentiment: "negative" as const,
    definitionEN: "facing a growing danger or risk",
    translationVI: "bị đe dọa ngày càng",
    relatedCollocates: ["seriously threatened", "gravely threatened", "severely threatened", "endangered species"],
    wordForms: {
      adjective: [
        { form: "threatened", meaning: "bị đe dọa" },
        { form: "threatening", meaning: "đe dọa" }
      ],
      noun: [
        { form: "threat", meaning: "mối đe dọa" },
        { form: "threats", meaning: "những mối đe dọa" }
      ]
    }
  },
  phase3Production: {
    taskType: "sentence_completion",
    content: "The coral reefs are _____ by rising ocean temperatures."
  }
};

const sampleTexts = {
  english: "Hello world! This is a demonstration of the text-to-speech functionality. You can control the speed, pitch, and volume of the speech. The text highlighting feature will show you which word is currently being spoken.",
  vietnamese: "Xin chào thế giới! Đây là một bản demo chức năng văn bản thành tiếng. Bạn có thể điều khiển tốc độ, cao độ và âm lượng của lời nói. Tính năng tô sáng văn bản sẽ cho bạn thấy từ nào đang được đọc.",
  long: "Artificial intelligence has revolutionized the way we interact with technology in recent years. From voice assistants that can understand natural language to machine learning models that can generate human-like text, AI has become an integral part of our daily lives. However, with great power comes great responsibility, and it's important to consider the ethical implications of these advanced technologies."
};

export default function SpeechDemoPage() {
  const [activeDemo, setActiveDemo] = useState("basic");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Volume2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Speech System Demo</h1>
            <Volume2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive demonstration of the improved speech synthesis system with text highlighting,
            multiple voices, and customizable settings.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">Clean Architecture</Badge>
            <Badge variant="secondary">Reusable Hook</Badge>
            <Badge variant="secondary">TypeScript Safe</Badge>
            <Badge variant="outline">Mobile Responsive</Badge>
          </div>
        </div>

        {/* Main Demo Content */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Basic Players
            </TabsTrigger>
            <TabsTrigger value="lexical" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Lexical Items
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Advanced Features
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Comparison
            </TabsTrigger>
          </TabsList>

          {/* Basic Players Demo */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <EnglishSpeechPlayer
                title="English Speech Player"
                text={sampleTexts.english}
                variant="standard"
                showSettings={true}
                showSleepTimer={true}
              />

              <VietnameseSpeechPlayer
                title="Vietnamese Speech Player"
                text={sampleTexts.vietnamese}
                variant="standard"
                showSettings={true}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SpeechPlayer
                title="Long Text Reading"
                text={sampleTexts.long}
                variant="detailed"
                defaultLanguage="en"
                showSettings={true}
              />

              <CompactSpeechPlayer
                title="Compact Version"
                text={sampleTexts.english}
                showText={true}
              />
            </div>
          </TabsContent>

          {/* Lexical Items Demo */}
          <TabsContent value="lexical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Lexical Item with Speech</CardTitle>
                <CardDescription>
                  Click on the highlighted word below to see the enhanced lexical item with improved collocate highlighting and audio pronunciation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-muted/30 rounded-lg text-lg leading-relaxed">
                  The polar bears are <LexicalItem item={sampleLexicalItem} guessMode={false}>
                    increasingly threatened
                  </LexicalItem> by climate change.
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Features Demonstrated:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• ✅ Main word pronunciation with Volume2 icon</li>
                    <li>• ✅ Enhanced collocate highlighting with gradient backgrounds</li>
                    <li>• ✅ Click-to-pronounce functionality for each collocate</li>
                    <li>• ✅ Mobile responsive design with proper truncation</li>
                    <li>• ✅ Visual feedback during speech playback</li>
                    <li>• ✅ Improved word forms layout (cards on mobile, table on desktop)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Features Demo */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Multiple Language Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <EnglishSpeechPlayer
                    title="English"
                    text="Welcome to our speech synthesis demonstration. This system supports multiple languages and voices."
                    variant="standard"
                  />

                  <VietnameseSpeechPlayer
                    title="Vietnamese"
                    text="Chào mừng đến với bản demo tổng hợp văn bản thành tiếng. Hệ thống này hỗ trợ nhiều ngôn ngữ và giọng đọc khác nhau."
                    variant="standard"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variants Comparison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Compact</h4>
                      <CompactSpeechPlayer
                        text="This is a compact version with minimal controls."
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Standard</h4>
                      <SpeechPlayer
                        text="This is the standard version with balanced controls and features."
                        variant="standard"
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Detailed</h4>
                      <SpeechPlayer
                        text="This is the detailed version with full settings and information display."
                        variant="detailed"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparison Demo */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Architecture Comparison</CardTitle>
                <CardDescription>
                  Comparison between the old implementation and the new improved speech system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600">Old Implementation Issues</h3>
                    <ul className="space-y-2 text-sm">
                      <li>❌ Manual speech synthesis management</li>
                      <li>❌ No error handling or validation</li>
                      <li>❌ No text highlighting capabilities</li>
                      <li>❌ Voice selection not available</li>
                      <li>❌ No sleep timer functionality</li>
                      <li>❌ Hard to reuse across components</li>
                      <li>❌ Limited TypeScript support</li>
                      <li>❌ Performance issues with repeated calls</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">New Implementation Benefits</h3>
                    <ul className="space-y-2 text-sm">
                      <li>✅ Clean, reusable useSpeech hook</li>
                      <li>✅ Comprehensive error handling</li>
                      <li>✅ Built-in text highlighting support</li>
                      <li>✅ Full voice management and selection</li>
                      <li>✅ Sleep timer with cancel functionality</li>
                      <li>✅ Highly modular and reusable</li>
                      <li>✅ Full TypeScript with proper types</li>
                      <li>✅ Performance optimized with useCallback</li>
                      <li>✅ Mobile responsive design</li>
                      <li>✅ Easy integration with existing code</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}