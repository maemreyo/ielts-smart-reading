#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { LegacyLexicalItem, LexicalItem, CollocateObject, UsageNoteObject, ConnotationObject } from '../src/types/lexical';

interface LexicalDataFile {
  logTitle: string;
  sourceId: string;
  totalItems: number;
  lexicalItems: LegacyLexicalItem[] | LexicalItem[];
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

// Transform string collocates to CollocateObject array
function transformCollocates(collocates: string[] | string | undefined): CollocateObject[] {
  if (!collocates) return [];

  if (typeof collocates === 'string') {
    // Handle comma-separated string
    const items = collocates.split(',').map(s => s.trim()).filter(s => s);
    return items.map(item => ({ form: item, meaning: '' }));
  }

  if (Array.isArray(collocates)) {
    return collocates.map((item: any) => {
      if (typeof item === 'string') {
        return { form: item, meaning: '' };
      } else if (typeof item === 'object' && item && item.form) {
        return { form: item.form, meaning: item.meaning || '' };
      }
      return { form: String(item), meaning: '' };
    });
  }

  return [];
}

// Transform string usageNotes to UsageNoteObject array
function transformUsageNotes(notes: string | undefined | any[]): UsageNoteObject[] {
  if (!notes) return [];

  // If it's already an array (from previous migration), check if it needs transformation
  if (Array.isArray(notes)) {
    // Check if it's already in the correct format and not nested
    if (notes.length > 0 && typeof notes[0] === 'object' && 'noteEN' in notes[0] && typeof notes[0].noteEN === 'string') {
      return notes; // Already in correct format
    }
    // Handle nested structure from previous migration
    if (notes.length > 0 && typeof notes[0] === 'object' && notes[0].noteEN && typeof notes[0].noteEN === 'object' && 'noteEN' in notes[0].noteEN) {
      return notes.map((nestedNote: any) => ({
        noteEN: nestedNote.noteEN.noteEN || '',
        noteVI: nestedNote.noteVI || ''
      }));
    }
    // If it's an array of strings, convert each one
    if (notes.length > 0 && typeof notes[0] === 'string') {
      return notes.map((note: string) => ({
        noteEN: note,
        noteVI: ''
      }));
    }
    return [];
  }

  // For string input, create a single usage note
  return [{
    noteEN: notes,
    noteVI: '' // Leave empty for manual completion
  }];
}

// Transform string connotation to ConnotationObject array
function transformConnotation(connotation: string | null | undefined | any[]): ConnotationObject[] {
  if (!connotation) return [];

  // Handle already migrated array
  if (Array.isArray(connotation)) {
    // Check if it's already in the correct format and not nested
    if (connotation.length > 0 && typeof connotation[0] === 'object' && 'noteEN' in connotation[0] && typeof connotation[0].noteEN === 'string') {
      return connotation; // Already in correct format
    }
    // Handle nested structure from previous migration
    if (connotation.length > 0 && typeof connotation[0] === 'object' && connotation[0].noteEN && typeof connotation[0].noteEN === 'object' && 'noteEN' in connotation[0].noteEN) {
      return connotation.map((nestedNote: any) => ({
        noteEN: nestedNote.noteEN.noteEN || '',
        noteVI: nestedNote.noteVI || ''
      }));
    }
    return [];
  }

  // For string input, create a single connotation object
  return [{
    noteEN: connotation,
    noteVI: '' // Leave empty for manual completion
  }];
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
      relatedCollocates: transformCollocates(legacyItem.phase2Annotation.relatedCollocates),
      wordForms: transformWordForms(legacyItem.phase2Annotation.wordForms),
      // New fields - use explicit falsy values so they appear in JSON
      register: "",
      connotation: transformConnotation((legacyItem.phase2Annotation as any).connotation),
      usageNotes: transformUsageNotes((legacyItem.phase2Annotation as any).usageNotes),
      contrastingCollocates: transformCollocates((legacyItem.phase2Annotation as any).contrastingCollocates)
    },
    phase3Production: legacyItem.phase3Production
  };
}

// Enhance current format lexical items to new structure
function enhanceLexicalItem(item: LexicalItem): LexicalItem {
  const enhancedItem = { ...item };

  // Transform phase2Annotation fields to new structure
  enhancedItem.phase2Annotation = {
    ...enhancedItem.phase2Annotation,
    relatedCollocates: transformCollocates(enhancedItem.phase2Annotation.relatedCollocates as any),
    connotation: transformConnotation(enhancedItem.phase2Annotation.connotation as any),
    usageNotes: transformUsageNotes(enhancedItem.phase2Annotation.usageNotes as any),
    contrastingCollocates: transformCollocates(enhancedItem.phase2Annotation.contrastingCollocates as any)
  };

  return enhancedItem;
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

    // Check if items need legacy migration or just enhancement
    const hasLegacyItems = data.lexicalItems.some((item: any) => typeof item.id === 'number');

    let migratedItems: LexicalItem[];
    if (hasLegacyItems) {
      console.log(`🔄 Migrating legacy format items...`);
      migratedItems = data.lexicalItems.map((item: any, itemIndex: number) =>
        migrateLexicalItem(item as LegacyLexicalItem, fileIndex, itemIndex)
      );
    } else {
      console.log(`🔧 Enhancing current format items...`);
      migratedItems = data.lexicalItems.map((item: any) => enhanceLexicalItem(item as LexicalItem));
    }

    // Create new data structure
    const migratedData = {
      ...data,
      totalItems: migratedItems.length,
      lexicalItems: migratedItems,
      migrationInfo: {
        migratedAt: new Date().toISOString(),
        version: '2.1', // New version for enhanced structure
        originalCount: data.lexicalItems.length,
        migratedCount: migratedItems.length,
        migrationType: hasLegacyItems ? 'legacy-to-enhanced' : 'current-to-enhanced'
      }
    };

    // Write migrated data back to file
    writeFileSync(filePath, JSON.stringify(migratedData, null, 2));

    console.log(`✅ Successfully ${hasLegacyItems ? 'migrated' : 'enhanced'} ${data.lexicalItems.length} items`);

  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error);
  }
}

// Main migration function
function main(): void {
  console.log('🚀 Starting lexical data enhancement to new structure...\n');

  const dataDirectory = join(process.cwd(), 'data');

  if (!existsSync(dataDirectory)) {
    console.error(`❌ Data directory not found: ${dataDirectory}`);
    process.exit(1);
  }

  // Find all JSON files
  const jsonFiles = findLexicalFiles(dataDirectory);
  console.log(`📁 Found ${jsonFiles.length} JSON files to process`);

  if (jsonFiles.length === 0) {
    console.log('ℹ️  No JSON files found to process');
    return;
  }

  // Confirm migration
  console.log('\n🔧 This will enhance lexical data to the new object-based structure:');
  console.log('   • relatedCollocates: string[] → CollocateObject[]');
  console.log('   • contrastingCollocates: string[] → CollocateObject[]');
  console.log('   • usageNotes: string → UsageNoteObject[]');
  console.log('   • connotation: string → ConnotationObject');
  console.log('📋 Backups will be created automatically.\n');

  // Migrate each file
  jsonFiles.forEach((file, index) => {
    migrateFile(file, index);
  });

  console.log('\n✨ Enhancement completed successfully!');
  console.log(`📊 Processed ${jsonFiles.length} files`);
  console.log('🔄 Original files have been backed up with .backup extension');
  console.log('💡 Meaning fields are left empty for manual completion');
}

// Run migration if this script is executed directly
if (require.main === module) {
  main();
}

export { migrateLexicalItem, migrateFile };