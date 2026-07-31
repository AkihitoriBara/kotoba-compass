import fs from 'fs';
import path from 'path';
import https from 'https';
import AdmZip from 'adm-zip';

const DICT_URL = 'https://github.com/yomidevs/jmdict-yomitan/releases/latest/download/JMnedict.zip';
const TEMP_ZIP = path.join(__dirname, 'jmnedict_temp.zip');
const EXTRACT_DIR = path.join(__dirname, 'temp_jmnedict_extracted');

const TARGET_DIR = path.join(__dirname, '../apps/extension/public/dictionaries/names');

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
        reject(new Error(`Failed to download JMnedict. Status code: ${response.statusCode}`));
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

/**
 * Mappings from raw proper name tags to standardized NameType.
 */
function mapNameType(tag: string): string {
  const t = tag.toLowerCase().trim();
  if (t === 'person') return 'person';
  if (t === 'surname') return 'surname';
  if (t === 'given' || t === 'masc' || t === 'fem') return 'given';
  if (t === 'place') return 'place';
  if (t === 'company') return 'company';
  if (t === 'organization' || t === 'org') return 'organization';
  if (t === 'station') return 'station';
  if (t === 'work' || t === 'char' || t === 'fiction') return 'fiction';
  return 'other';
}

/**
 * Standard Hepburn-style Hiragana/Katakana to Romaji converter for proper nouns.
 */
function toRomaji(kana: string): string {
  const map: Record<string, string> = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'o', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヲ': 'o', 'ン': 'n',
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'ざ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ぜ': 'ze', 'ゾ': 'zo',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po'
  };

  const digraphs: Record<string, string> = {
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
    'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
    'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
    'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
    'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
    'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
    'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
    'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
    'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
    'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
    'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
    'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo'
  };

  let result = '';
  let i = 0;
  while (i < kana.length) {
    if (i + 1 < kana.length) {
      const doubleChar = kana.substring(i, i + 2);
      if (digraphs[doubleChar]) {
        result += digraphs[doubleChar];
        i += 2;
        continue;
      }
    }

    const char = kana[i];
    if (char === 'っ' || char === 'ッ') {
      if (i + 1 < kana.length) {
        const nextChar = kana[i + 1];
        const nextRomaji = digraphs[kana.substring(i + 1, i + 3)] || map[nextChar];
        if (nextRomaji) {
          result += nextRomaji[0];
        }
      }
      i++;
      continue;
    }

    if (char === 'ー') {
      i++;
      continue;
    }

    result += map[char] || char;
    i++;
  }

  if (result.length > 0) {
    return result[0].toUpperCase() + result.substring(1);
  }
  return result;
}

function processJmnedict() {
  console.log('Unzipping JMnedict archive...');
  const zip = new AdmZip(TEMP_ZIP);
  zip.extractAllTo(EXTRACT_DIR, true);

  const files = fs.readdirSync(EXTRACT_DIR);
  const bankFiles = files.filter(f => f.startsWith('term_bank') && f.endsWith('.json'));
  
  if (bankFiles.length === 0) {
    throw new Error('No term bank JSON files found in extracted archive.');
  }

  console.log(`Found ${bankFiles.length} name bank files. Processing entries...`);

  // Initialize 100 buckets
  const buckets: Array<Array<{
    w: string;   // written
    r: string;   // reading
    m: string[]; // meanings
    t: string;   // type
    tags?: string[]; // tags
    p?: number;  // priority score
  }>> = Array.from({ length: 100 }, () => []);

  let totalEntries = 0;
  let validEntries = 0;
  let skippedEntries = 0;
  const MAX_LOG_WARNINGS = 50;

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

      // Yomichan format: [written, reading, definition_tags, rules, score, glossary, sequence, tags]
      const written = entry[0];
      const rawReading = entry[1];
      const rawType = entry[2] || '';
      const score = entry[4];
      const glossary = entry[5];
      const extraTagsStr = entry[7] || '';

      // --- VALIDATION PHASE ---
      // 1. Check required fields exist
      if (!written || !glossary || !Array.isArray(glossary) || glossary.length === 0) {
        if (skippedEntries < MAX_LOG_WARNINGS) {
          console.warn(`[Validation Warning] Skipping name entry due to missing required fields:`, entry);
        } else if (skippedEntries === MAX_LOG_WARNINGS) {
          console.warn(`[Validation Warning] Suppressing further warnings (limit reached).`);
        }
        skippedEntries++;
        continue;
      }

      // 2. Validate types
      if (typeof written !== 'string') {
        if (skippedEntries < MAX_LOG_WARNINGS) {
          console.warn(`[Validation Warning] Skipping name entry due to invalid field types:`, entry);
        } else if (skippedEntries === MAX_LOG_WARNINGS) {
          console.warn(`[Validation Warning] Suppressing further warnings (limit reached).`);
        }
        skippedEntries++;
        continue;
      }

      validEntries++;

      // Mapped values
      let reading = rawReading || '';
      let meanings = glossary;

      // Detect if the glossary actually holds Japanese Kana names
      const isKanaGlossary = glossary.some(g => /[\u3040-\u30ff]/.test(g));

      if (!reading || isKanaGlossary) {
        const kanaReadings = glossary.filter(g => /[\u3040-\u30ff]/.test(g));
        if (kanaReadings.length > 0) {
          reading = kanaReadings.join(', ');
          meanings = Array.from(new Set(kanaReadings.map(toRomaji)));
        } else {
          reading = rawReading || written;
          meanings = glossary;
        }
      }

      // Map raw name classification
      const tags = rawType.split(/\s+/).filter(Boolean);
      let mappedType = 'other';
      for (const tag of tags) {
        const mapped = mapNameType(tag);
        if (mapped !== 'other') {
          mappedType = mapped;
          break;
        }
      }

      const extraTags = extraTagsStr.split(/\s+/).filter(Boolean);

      const compactEntry = {
        w: written,
        r: reading,
        m: meanings,
        t: mappedType,
        tags: extraTags.length > 0 ? extraTags : undefined,
        p: typeof score === 'number' ? score : undefined,
      };

      // --- BUCKETING PHASE ---
      const bucketIndex = written.charCodeAt(0) % 100;
      buckets[bucketIndex].push(compactEntry);
    }
  }

  console.log(`Processed ${totalEntries} proper names. Validated: ${validEntries}. Skipped: ${skippedEntries}.`);

  console.log('Writing hashed buckets to public/dictionaries/names...');
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  for (let i = 0; i < 100; i++) {
    const bucketPath = path.join(TARGET_DIR, `bucket_${i}.json`);
    fs.writeFileSync(bucketPath, JSON.stringify(buckets[i]), 'utf8');
  }

  console.log('Clean up temporary files...');
  if (fs.existsSync(TEMP_ZIP)) fs.unlinkSync(TEMP_ZIP);
  fs.rmSync(EXTRACT_DIR, { recursive: true, force: true });
  
  console.log('JMnedict build completed successfully!');
}

async function main() {
  try {
    console.log('Downloading JMnedict proper name dataset...');
    await downloadFile(DICT_URL, TEMP_ZIP);
    processJmnedict();
  } catch (error) {
    console.error('Error compiling JMnedict:', error);
    process.exit(1);
  }
}

main();
