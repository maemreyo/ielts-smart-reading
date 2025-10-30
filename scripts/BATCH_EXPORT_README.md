# Vocabulary Batch Export & Merge Guide

## Overview
This guide explains how to use the new batch export functionality in the self-learning page to efficiently process vocabulary items with AI tools like Gemini AI Studio.

## 🎯 Use Case
When you have many vocabulary items (50+), the JSON file becomes too large for AI Studio to process efficiently. This system splits vocabulary into manageable batches of 25-30 items each.

## 📋 Flow Summary

1. **Highlight vocabulary** in the self-learning page
2. **Export as batches** (25-30 items per file)
3. **Upload batches** to AI Studio for enrichment
4. **Run merge script** to combine processed files
5. **Use merged file** in your vocabulary system

## 🔧 How to Use

### Step 1: Export Batches from Self-Learning Page

1. Go to any self-learning page (e.g., `/self-learning/16/test-1/1`)
2. Highlight vocabulary items as usual
3. Click the 📦 package icon in the vocabulary sidebar
4. Configure batch options:
   - **Items per batch**: Choose 20, 25 (recommended), or 30 items
   - **Include master file**: ✅ (recommended) to keep a complete backup
5. Click **"Export All Batches"**

### Files Created

Example with 100 items, 25 items per batch:

```
master-vocabulary.json     # Complete backup (100 items)
batch-01-of-04.json       # Batch 1 (25 items)
batch-02-of-04.json       # Batch 2 (25 items)
batch-03-of-04.json       # Batch 3 (25 items)
batch-04-of-04.json       # Batch 4 (25 items)
```

### Step 2: Process Batches in AI Studio

1. Upload each `batch-XX-of-XX.json` file to Gemini AI Studio
2. Enrich the vocabulary items with:
   - Better definitions
   - More examples
   - Enhanced connotations
   - Usage notes
   - etc.
3. Download the processed files with the same filenames

### Step 3: Merge Processed Files

Run the merge script to combine all processed batch files back into one master file:

```bash
# Navigate to your project directory
cd /path/to/ielts-smart-reading

# Run the merge script
node scripts/merge-vocabulary-batches.js <batch-directory> <output-file>

# Example:
node scripts/merge-vocabulary-batches.js ./processed-batches ./enriched-vocabulary.json
```

### Expected Output

The merge script will:
- ✅ Combine all batch files
- ✅ Remove duplicates based on item IDs
- ✅ Sort items consistently
- ✅ Create a master file with enriched vocabulary
- ✅ Generate a merge report
- ✅ Provide file statistics

## 📊 Batch File Structure

### Individual Batch File (`batch-01-of-04.json`)
```json
{
  "batchInfo": {
    "filename": "batch-01-of-04.json",
    "batchNumber": 1,
    "totalBatches": 4,
    "itemCount": 25,
    "createdFromMaster": "master-vocabulary.json"
  },
  "items": [
    {
      "id": "1691234567890",
      "targetLexeme "increasingly threatened"",
      "sourceContext": "Polar bears are being increasingly threatened...",
      "phase2Annotation": {
        "definitionEN": "Your AI-enriched definition",
        "translationVI": "Your AI-enriched translation",
        "register": "neutral",
        "connotation": "environmental",
        "usageNotes": "Often used in climate change contexts",
        "contrastingCollocates": ["safe from threats", "secure environment"],
        // ... other fields
      }
    }
    // ... 24 more items
  ]
}
```

### Merged Master File (`enriched-vocabulary.json`)
```json
{
  "logTitle": "Merged Self-Learning Vocabulary Data",
  "sourceId": "Self-learning (Merged from Batches)",
  "totalItems": 100,
  "mergeInfo": {
    "mergedAt": "2024-10-30T08:30:00.000Z",
    "sourceDirectory": "./processed-batches",
    "batchesProcessed": 4,
    "originalItemCount": 100,
    "finalItemCount": 100,
    "duplicatesRemoved": 0
  },
  "lexicalItems": [
    // All 100 enriched vocabulary items
  ]
}
```

## 🎛 Advanced Features

### Smart Batch Distribution
The system ensures batches are evenly distributed:
- Last batch won't have just 1-2 items
- Items are distributed to avoid tiny remaining batches
- Maximum batch size is respected

### Batch Naming Convention
- Format: `batch-XX-of-YY.json`
- Padded with leading zeros for proper sorting
- Clear indication of batch position

### Deduplication
- Automatic duplicate removal based on item IDs
- Preserves the most recent version of duplicate items
- Reports how many duplicates were removed

## 🔧 Script Options

### Merge Script Options
```bash
# Basic merge
node scripts/merge-vocabulary-batches.js ./batches ./merged.json

# With custom batch directory
node scripts/merge-vocabulary-batches.js ./my-batches ./my-master-file.json

# Help
node scripts/merge-vocabulary-batches.js
```

### Error Handling
- Invalid JSON files are skipped with warnings
- Missing directory errors are clearly reported
- Merge reports help troubleshoot issues

## 📱 File Management Tips

### Before Export
- Review highlighted items for quality
- Remove unwanted highlights
- Consider the optimal batch size for your AI tool

### During Processing
- Keep original filenames intact
- Process batches in the same order
- Don't modify the `batchInfo` section

### After Processing
- Verify all files processed successfully
- Check the merge report for any issues
- Test the merged file in your application

## 🚀 Best Practices

1. **Consistent Enrichment**: Apply the same quality standards to all batches
2. **Backup Original Files**: Keep the original master file as reference
3. **Test Sample Batches**: Process 1-2 small batches first to validate your approach
4. **Review Merge Report**: Check for any unexpected issues in the merge process
5. **Update Vocabulary System**: Replace old files with the merged, enriched version

## 🐛 Troubleshooting

### Common Issues

**Script not found**:
```bash
chmod +x scripts/merge-vocabulary-batches.js
```

**Invalid JSON errors**:
- Check that AI Studio output is valid JSON
- Ensure no trailing commas or syntax errors
- Use a JSON validator if needed

**Missing items after merge**:
- Check the merge report for processing errors
- Verify all batch files were processed
- Look for ID conflicts in duplicate removal

### Getting Help

If you encounter issues:
1. Check the console output for specific error messages
2. Review the merge report file (`*-merge-report.txt`)
3. Verify batch file naming convention
4. Test with smaller batches first

---

**Ready to use!** 🎉 The batch export system is designed to make your vocabulary enrichment workflow more efficient and manageable.