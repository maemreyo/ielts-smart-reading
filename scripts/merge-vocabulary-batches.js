#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Merge vocabulary batch files back into a master file
 * Usage: node scripts/merge-vocabulary-batches.js <input-directory> <output-file>
 * Example: node scripts/merge-vocabulary-batches.js ./batches ./merged-vocabulary.json
 */

function mergeBatches(inputDir, outputFile) {
  try {
    console.log('🔍 Looking for batch files in:', inputDir);

    // Check if input directory exists
    if (!fs.existsSync(inputDir)) {
      console.error('❌ Input directory does not exist:', inputDir);
      process.exit(1);
    }

    // Find all batch files (sorted by filename to maintain order)
    const batchFiles = fs.readdirSync(inputDir)
      .filter(file => file.startsWith('batch-') && file.endsWith('.json'))
      .sort((a, b) => {
        // Extract batch numbers for proper sorting
        const aMatch = a.match(/batch-(\d+)-of-(\d+)\.json/);
        const bMatch = b.match(/batch-(\d+)-of-(\d+)\.json/);

        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        return a.localeCompare(b);
      });

    if (batchFiles.length === 0) {
      console.log('ℹ️  No batch files found in directory');
      return;
    }

    console.log(`📁 Found ${batchFiles.length} batch files:`);
    batchFiles.forEach(file => console.log(`   - ${file}`));

    let allItems = [];
    let totalItems = 0;
    let processedBatches = 0;

    // Process each batch file
    batchFiles.forEach((file, index) => {
      const filePath = path.join(inputDir, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const batchData = JSON.parse(content);

        // Extract items from batch data
        let items = [];

        if (batchData.items && Array.isArray(batchData.items)) {
          // New format with batchInfo wrapper
          items = batchData.items;
          console.log(`📦 Batch ${index + 1}: ${items.length} items (from batchInfo)`);
        } else if (Array.isArray(batchData)) {
          // Direct array format
          items = batchData;
          console.log(`📦 Batch ${index + 1}: ${items.length} items (direct array)`);
        } else if (batchData.lexicalItems && Array.isArray(batchData.lexicalItems)) {
          // Master file format
          items = batchData.lexicalItems;
          console.log(`📦 Master file: ${items.length} items`);
        } else {
          console.warn(`⚠️  Unknown format in ${file}, skipping`);
          return;
        }

        allItems.push(...items);
        totalItems += items.length;
        processedBatches++;

      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    });

    // Remove duplicates based on ID
    const uniqueItems = [];
    const seenIds = new Set();

    allItems.forEach(item => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueItems.push(item);
      }
    });

    console.log(`\n📊 Merge Summary:`);
    console.log(`   - Processed batches: ${processedBatches}/${batchFiles.length}`);
    console.log(`   - Total items found: ${totalItems}`);
    console.log(`   - Unique items after deduplication: ${uniqueItems.length}`);
    console.log(`   - Duplicates removed: ${totalItems - uniqueItems.length}`);

    // Create master file structure
    const masterData = {
      logTitle: "Merged Self-Learning Vocabulary Data",
      sourceId: "Self-learning (Merged from Batches)",
      totalItems: uniqueItems.length,
      mergeInfo: {
        mergedAt: new Date().toISOString(),
        sourceDirectory: inputDir,
        batchesProcessed: processedBatches,
        originalItemCount: totalItems,
        finalItemCount: uniqueItems.length,
        duplicatesRemoved: totalItems - uniqueItems.length
      },
      lexicalItems: uniqueItems.sort((a, b) => {
        // Sort by ID to maintain consistent order
        return a.id.localeCompare(b.id);
      })
    };

    // Write merged file
    fs.writeFileSync(outputFile, JSON.stringify(masterData, null, 2));

    console.log(`\n✅ Successfully merged batches into: ${outputFile}`);
    console.log(`📄 Output file size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);

    // Create a summary report
    const reportFile = outputFile.replace('.json', '-merge-report.txt');
    const report = `Vocabulary Merge Report
=====================

Source Directory: ${inputDir}
Output File: ${outputFile}
Merge Date: ${new Date().toISOString()}

Input Files:
${batchFiles.map(file => `  - ${file}`).join('\n')}

Statistics:
- Total input files: ${batchFiles.length}
- Successfully processed: ${processedBatches}
- Total items found: ${totalItems}
- Unique items: ${uniqueItems.length}
- Duplicates removed: ${totalItems - uniqueItems.length}
- Output file size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB

Next Steps:
1. Review the merged file: ${outputFile}
2. Check for any data inconsistencies
3. Update your application to use the merged file if needed

Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync(reportFile, report);
    console.log(`📋 Merge report created: ${reportFile}`);

  } catch (error) {
    console.error('❌ Error during merge:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Usage: node scripts/merge-vocabulary-batches.js <input-directory> <output-file>');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/merge-vocabulary-batches.js ./batches ./merged-vocabulary.json');
  console.log('  node scripts/merge-vocabulary-batches.js /path/to/batches ./master-vocabulary.json');
  console.log('');
  console.log('The script will:');
  console.log('1. Find all batch-*.json files in the input directory');
  console.log('2. Merge them into a single master file');
  console.log('3. Remove duplicates based on item IDs');
  console.log('4. Create a merge report');
  process.exit(1);
}

const [inputDir, outputFile] = args;

// Run the merge
mergeBatches(inputDir, outputFile);