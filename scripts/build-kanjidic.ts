import fs from 'fs';
import path from 'path';
import https from 'https';
import AdmZip from 'adm-zip';

const KANJI_URL = 'https://github.com/yomidevs/jmdict-yomitan/releases/latest/download/KANJIDIC_english.zip';
const TEMP_ZIP = path.join(__dirname, 'kanjidic_temp.zip');
const EXTRACT_DIR = path.join(__dirname, 'temp_kanji_extracted');

const TARGET_DIR = path.join(__dirname, '../apps/extension/public/dictionaries/kanji');

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download KANJIDIC. Status code: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function processKanjidic() {
  console.log('Unzipping KANJIDIC archive...');
  const zip = new AdmZip(TEMP_ZIP);
  zip.extractAllTo(EXTRACT_DIR, true);

  const files = fs.readdirSync(EXTRACT_DIR);
  const bankFiles = files.filter(f => f.startsWith('kanji_bank') && f.endsWith('.json'));
  
  if (bankFiles.length === 0) {
    throw new Error('No kanji bank JSON files found in extracted archive.');
  }

  console.log(`Found ${bankFiles.length} kanji bank files. Processing entries...`);

  // Initialize 100 buckets
  const buckets: Array<Array<{
    k: string;    // kanji
    on: string[]; // onyomi
    kun: string[];// kunyomi
    m: string[];  // meanings
    s: number;    // strokes
    r?: string;   // radical (nelson_c radical number)
    jlpt?: number;// jlpt level
    freq?: number;// frequency rank
    g?: number;   // grade
  }>> = Array.from({ length: 100 }, () => []);

  let totalEntries = 0;
  let validEntries = 0;
  let skippedEntries = 0;

  for (const bankFile of bankFiles) {
    const jsonPath = path.join(EXTRACT_DIR, bankFile);
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const entries = JSON.parse(rawData);

    if (!Array.isArray(entries)) {
      console.warn(`Warning: bank file ${bankFile} is not an array. Skipping.`);
      continue;
    }

    for (const entry of entries) {
      totalEntries++;

      // Yomichan format: [kanji, onyomi, kunyomi, tags, meanings, stats]
      const kanji = entry[0];
      const onyomiStr = entry[1] || '';
      const kunyomiStr = entry[2] || '';
      const meanings = entry[4];
      const stats = entry[5] || {};

      // --- VALIDATION PHASE ---
      // 1. Check required fields exist
      if (!kanji || !meanings || !Array.isArray(meanings)) {
        console.warn(`[Validation Warning] Skipping entry due to missing required fields:`, entry);
        skippedEntries++;
        continue;
      }

      // 2. Validate kanji character is a single Japanese kanji character
      if (typeof kanji !== 'string' || kanji.length !== 1 || !/[\u4e00-\u9faf]/.test(kanji)) {
        console.warn(`[Validation Warning] Skipping entry with invalid kanji character "${kanji}"`);
        skippedEntries++;
        continue;
      }

      // 3. Verify stroke count exists and is numeric
      const strokeCount = parseInt(stats.strokes, 10);
      if (isNaN(strokeCount)) {
        console.warn(`[Validation Warning] Skipping entry "${kanji}" due to non-numeric stroke count:`, stats.strokes);
        skippedEntries++;
        continue;
      }

      validEntries++;

      // Parse optional fields
      const onyomi = onyomiStr.split(/\s+/).filter(Boolean);
      const kunyomi = kunyomiStr.split(/\s+/).filter(Boolean);
      const jlptLevel = stats.jlpt ? parseInt(stats.jlpt, 10) : undefined;
      const frequency = stats.freq ? parseInt(stats.freq, 10) : undefined;
      const grade = stats.grade ? parseInt(stats.grade, 10) : undefined;
      const radical = stats.nelson_c || stats.radical || undefined;

      const compactEntry = {
        k: kanji,
        on: onyomi,
        kun: kunyomi,
        m: meanings,
        s: strokeCount,
        r: radical,
        jlpt: jlptLevel,
        freq: frequency,
        g: grade,
      };

      // --- BUCKETING PHASE ---
      const bucketIndex = kanji.charCodeAt(0) % 100;
      buckets[bucketIndex].push(compactEntry);
    }
  }

  console.log(`Processed ${totalEntries} entries. Validated: ${validEntries}. Skipped: ${skippedEntries}.`);

  console.log('Writing hashed buckets to extension public folder...');
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  for (let i = 0; i < 100; i++) {
    const bucketPath = path.join(TARGET_DIR, `bucket_${i}.json`);
    fs.writeFileSync(bucketPath, JSON.stringify(buckets[i]), 'utf8');
  }

  console.log('Clean up temporary files...');
  fs.unlinkSync(TEMP_ZIP);
  fs.rmSync(EXTRACT_DIR, { recursive: true, force: true });
  
  console.log('KANJIDIC build completed successfully!');
}

async function main() {
  try {
    console.log('Downloading KANJIDIC2 English dataset...');
    await downloadFile(KANJI_URL, TEMP_ZIP);
    processKanjidic();
  } catch (error) {
    console.error('Error compiling KANJIDIC:', error);
    process.exit(1);
  }
}

main();
