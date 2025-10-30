#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { LegacyLexicalItem, LexicalItem } from '../src/types/lexical';

interface LexicalDataFile {
  logTitle: string;
  sourceId: string;
  totalItems: number;
  lexicalItems: LegacyLexicalItem[];
}

// Generate unique ID for each lexical item
function generateUniqueId(item: LegacyLexicalItem, fileIndex: number, itemIndex: number): string {
  // Use a combination of timestamp, file index, and item index for uniqueness
  const timestamp = Date.now();
  // Create a simple hash without btoa to avoid Unicode issues
  const content = `${item.targetLexeme}-${item.sourceContext}-${fileIndex}-${itemIndex}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const absHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `${timestamp}-${fileIndex}-${itemIndex}-${absHash}`;
}

// Transform legacy wordForms to new structure
function transformWordForms(wordForms: any): any {
  if (!wordForms) return undefined;

  const newWordForms: any = {
    noun: wordForms.noun || [],
    verb: wordForms.verb || [],
    adjective: wordForms.adjective || [],
    adverb: wordForms.adverb || []
  };

  // Ensure all word forms have the correct structure
  Object.keys(newWordForms).forEach(key => {
    if (Array.isArray(newWordForms[key])) {
      newWordForms[key] = newWordForms[key].map((form: any) => {
        if (typeof form === 'object' && form.form && form.meaning) {
          return form;
        } else if (typeof form === 'string') {
          return { form, meaning: '' };
        }
        return { form: '', meaning: '' };
      });
    }
  });

  return newWordForms;
}

// Migrate a single lexical item
function migrateLexicalItem(
  legacyItem: LegacyLexicalItem,
  fileIndex: number,
  itemIndex: number
): LexicalItem {
  return {
    id: generateUniqueId(legacyItem, fileIndex, itemIndex),
    targetLexeme: legacyItem.targetLexeme,
    sourceContext: legacyItem.sourceContext,
    phase1Inference: legacyItem.phase1Inference || {},
    phase2Annotation: {
      phonetic: legacyItem.phase2Annotation.phonetic,
      sentiment: legacyItem.phase2Annotation.sentiment,
      definitionEN: legacyItem.phase2Annotation.definitionEN,
      translationVI: legacyItem.phase2Annotation.translationVI,
      relatedCollocates: legacyItem.phase2Annotation.relatedCollocates || [],
      wordForms: transformWordForms(legacyItem.phase2Annotation.wordForms),
      // New fields - empty for now since they don't exist in legacy data
      register: undefined,
      connotation: undefined,
      usageNotes: undefined,
      contrastingCollocates: undefined
    },
    phase3Production: legacyItem.phase3Production
  };
}

// Find all JSON files in the data directory
function findLexicalFiles(directory: string, files: string[] = []): string[] {
  const entries = require('fs').readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      findLexicalFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Create backup of original file
function createBackup(filePath: string): void {
  const backupPath = `${filePath}.backup.${Date.now()}`;
  const content = readFileSync(filePath, 'utf-8');
  writeFileSync(backupPath, content);
  console.log(`✅ Backup created: ${backupPath}`);
}

// Migrate a single file
function migrateFile(filePath: string, fileIndex: number): void {
  try {
    console.log(`\n📄 Processing: ${filePath}`);

    // Create backup
    createBackup(filePath);

    // Read and parse the file
    const content = readFileSync(filePath, 'utf-8');
    const data: LexicalDataFile = JSON.parse(content);

    // Migrate lexical items
    const migratedItems: LexicalItem[] = data.lexicalItems.map((item, itemIndex) =>
      migrateLexicalItem(item, fileIndex, itemIndex)
    );

    // Create new data structure
    const migratedData = {
      ...data,
      totalItems: migratedItems.length,
      lexicalItems: migratedItems,
      migrationInfo: {
        migratedAt: new Date().toISOString(),
        version: '2.0',
        originalCount: data.lexicalItems.length,
        migratedCount: migratedItems.length
      }
    };

    // Write migrated data back to file
    writeFileSync(filePath, JSON.stringify(migratedData, null, 2));

    console.log(`✅ Successfully migrated ${data.lexicalItems.length} items`);

  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error);
  }
}

// Main migration function
function main(): void {
  console.log('🚀 Starting lexical data migration...\n');

  const dataDirectory = join(process.cwd(), 'data');

  if (!existsSync(dataDirectory)) {
    console.error(`❌ Data directory not found: ${dataDirectory}`);
    process.exit(1);
  }

  // Find all JSON files
  const jsonFiles = findLexicalFiles(dataDirectory);
  console.log(`📁 Found ${jsonFiles.length} JSON files to migrate`);

  if (jsonFiles.length === 0) {
    console.log('ℹ️  No JSON files found to migrate');
    return;
  }

  // Confirm migration
  console.log('\n⚠️  This will migrate all lexical data files to the new schema.');
  console.log('📋 Backups will be created automatically.\n');

  // Migrate each file
  jsonFiles.forEach((file, index) => {
    migrateFile(file, index);
  });

  console.log('\n✨ Migration completed successfully!');
  console.log(`📊 Processed ${jsonFiles.length} files`);
  console.log('🔄 Original files have been backed up with .backup extension');
}

// Run migration if this script is executed directly
if (require.main === module) {
  main();
}

export { migrateLexicalItem, migrateFile };