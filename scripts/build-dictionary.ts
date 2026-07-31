import fs from 'fs';
import path from 'path';
import https from 'https';
import AdmZip from 'adm-zip';

const DICT_URL = 'https://github.com/scriptin/jmdict-simplified/releases/download/3.6.2%2B20260706150322/jmdict-eng-common-3.6.2+20260706150322.json.zip';
const TEMP_ZIP = path.join(__dirname, 'jmdict_temp.zip');
const EXTRACT_DIR = path.join(__dirname, 'temp_extracted');

const TARGET_DIR = path.join(__dirname, '../apps/extension/public/dictionaries/vocabulary');
const KANJI_DIR = path.join(__dirname, '../apps/extension/public/dictionaries/kanji');
const NAMES_DIR = path.join(__dirname, '../apps/extension/public/dictionaries/names');

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
        reject(new Error(`Failed to download dictionary. Status code: ${response.statusCode}`));
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

function processDictionary() {
  console.log('Unzipping dictionary archive...');
  const zip = new AdmZip(TEMP_ZIP);
  zip.extractAllTo(EXTRACT_DIR, true);

  const files = fs.readdirSync(EXTRACT_DIR);
  const jsonFile = files.find(f => f.endsWith('.json'));
  if (!jsonFile) {
    throw new Error('No JSON file found in extracted zip archive.');
  }

  const jsonPath = path.join(EXTRACT_DIR, jsonFile);
  console.log(`Parsing dictionary database: ${jsonFile}...`);
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const parsed = JSON.parse(rawData);

  if (!parsed.words || !Array.isArray(parsed.words)) {
    throw new Error('Invalid dictionary structure. Expected "words" array.');
  }

  console.log(`Processing ${parsed.words.length} entries...`);
  
  // Initialize 100 buckets
  const buckets: Array<Array<{
    w: string;   // word
    r: string;   // reading
    m: string[]; // meanings
    p: string[]; // partOfSpeech
  }>> = Array.from({ length: 100 }, () => []);

  for (const entry of parsed.words) {
    // 1. Gather word forms
    const kanjiForms: string[] = (entry.kanji || []).map((k: any) => k.text);
    const kanaForms: string[] = (entry.kana || []).map((k: any) => k.text);
    
    // Primary word representations
    const primaryWord = kanjiForms[0] || kanaForms[0] || '';
    const primaryReading = kanaForms[0] || '';
    
    if (!primaryWord) continue;

    // 2. Gather meanings and parts of speech
    const meanings: string[] = [];
    const partOfSpeechSet = new Set<string>();

    for (const sense of entry.sense || []) {
      const glosses = (sense.gloss || [])
        .filter((g: any) => !g.lang || g.lang === 'eng')
        .map((g: any) => g.text);
      
      meanings.push(...glosses);
      
      for (const pos of sense.partOfSpeech || []) {
        partOfSpeechSet.add(pos);
      }
    }

    if (meanings.length === 0) continue;

    const compactRecord = {
      w: primaryWord,
      r: primaryReading,
      m: meanings,
      p: Array.from(partOfSpeechSet),
    };

    // 3. Hash and index under ALL spellings (kanji and kana forms)
    const uniqueTerms = new Set([...kanjiForms, ...kanaForms]);
    for (const term of uniqueTerms) {
      if (!term) continue;
      const bucketIndex = term.charCodeAt(0) % 100;
      // Prevent duplicates in the same bucket
      const bucket = buckets[bucketIndex];
      const exists = bucket.some(item => item.w === compactRecord.w && item.r === compactRecord.r);
      if (!exists) {
        bucket.push(compactRecord);
      }
    }
  }

  console.log('Writing hashed buckets to extension assets...');
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  fs.mkdirSync(KANJI_DIR, { recursive: true });
  fs.mkdirSync(NAMES_DIR, { recursive: true });

  // Create simple placeholders for kanji and names
  fs.writeFileSync(path.join(KANJI_DIR, '.keep'), '');
  fs.writeFileSync(path.join(NAMES_DIR, '.keep'), '');

  for (let i = 0; i < 100; i++) {
    const bucketPath = path.join(TARGET_DIR, `bucket_${i}.json`);
    fs.writeFileSync(bucketPath, JSON.stringify(buckets[i]), 'utf8');
  }

  console.log('Clean up temporary files...');
  fs.unlinkSync(TEMP_ZIP);
  fs.rmSync(EXTRACT_DIR, { recursive: true, force: true });
  
  console.log('Build completed successfully!');
}

async function main() {
  try {
    console.log('Downloading JMdict Eng Common dataset...');
    await downloadFile(DICT_URL, TEMP_ZIP);
    processDictionary();
  } catch (error) {
    console.error('Error compiling dictionary:', error);
    process.exit(1);
  }
}

main();
