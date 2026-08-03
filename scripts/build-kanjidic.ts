import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import zlib from 'zlib';
import AdmZip from 'adm-zip';

const KANJI_URL = 'https://github.com/yomidevs/jmdict-yomitan/releases/latest/download/KANJIDIC_english.zip';
const KANJIDIC2_URL = 'http://ftp.edrdg.org/pub/Nihongo/kanjidic2.xml.gz';
const KANJIDIC2_MIRROR_URL = 'https://raw.githubusercontent.com/jmettraux/kodika/master/data/kanjidic2.xml';

const TEMP_ZIP = path.join(__dirname, 'kanjidic_temp.zip');
const EXTRACT_DIR = path.join(__dirname, 'temp_kanji_extracted');
const TARGET_DIR = path.join(__dirname, '../apps/extension/public/dictionaries/kanji');

// 214 Classical Kangxi Radicals mapped to their display symbol & common variants
const RADICAL_SYMBOLS: Record<number, string> = {
  1: "一", 2: "丨", 3: "丶", 4: "丿", 5: "乙", 6: "亅", 7: "二", 8: "亠", 9: "人", 10: "儿",
  11: "入", 12: "八", 13: "冂", 14: "冖", 15: "冫", 16: "几", 17: "凵", 18: "刀 (刂)", 19: "力", 20: "勹",
  21: "匕", 22: "匚", 23: "匸", 24: "十", 25: "卜", 26: "卩", 27: "厂", 28: "厶", 29: "又", 30: "口",
  31: "囗", 32: "土", 33: "士", 34: "夂", 35: "夊", 36: "夕", 37: "大", 38: "女", 39: "子", 40: "宀",
  41: "寸", 42: "小", 43: "尢", 44: "尸", 45: "屮", 46: "山", 47: "巛", 48: "工", 49: "己", 50: "巾",
  51: "干", 52: "幺", 53: "广", 54: "廴", 55: "廾", 56: "弋", 57: "弓", 58: "彐", 59: "彡", 60: "彳",
  61: "心 (忄)", 62: "戈", 63: "戶", 64: "手 (手, 扌)", 65: "支", 66: "攴 (攵)", 67: "文", 68: "斗", 69: "斤", 70: "方",
  71: "无", 72: "日", 73: "曰", 74: "月", 75: "木", 76: "欠", 77: "止", 78: "歹", 79: "殳", 80: "毋",
  81: "比", 82: "毛", 83: "氏", 84: "气", 85: "水 (氵)", 86: "火 (灬)", 87: "爪 (爫)", 88: "父", 89: "爻", 90: "爿",
  91: "片", 92: "牙", 93: "牛 (牜)", 94: "犬 (犭)", 95: "玄", 96: "玉 (王)", 97: "瓜", 98: "瓦", 99: "甘", 100: "生",
  101: "用", 102: "田", 103: "疋", 104: "疒", 105: "癶", 106: "白", 107: "皮", 108: "皿", 109: "目", 110: "矛",
  111: "矢", 112: "石", 113: "示 (礻)", 114: "禸", 115: "禾", 116: "穴", 117: "立", 118: "竹", 119: "米", 120: "糸",
  121: "缶", 122: "网 (罒)", 123: "羊", 124: "羽", 125: "老", 126: "而", 127: "耒", 128: "耳", 129: "聿", 130: "肉 (月)",
  131: "臣", 132: "自", 133: "至", 134: "臼", 135: "舌", 136: "舛", 137: "舟", 138: "艮", 139: "色", 140: "艸 (艹)",
  141: "虍", 142: "虫", 143: "血", 144: "行", 145: "衣 (⻂)", 146: "襾", 147: "見", 148: "角", 149: "言 (訁)", 150: "谷",
  151: "豆", 152: "豕", 153: "豸", 154: "貝", 155: "赤", 156: "走", 157: "足", 158: "身", 159: "車", 160: "辛",
  161: "辰", 162: "辵 (⻌)", 163: "邑 (⻏)", 164: "酉", 165: "釆", 166: "里", 167: "金", 168: "長", 169: "門", 170: "阜 (⻏)",
  171: "隶", 172: "隹", 173: "雨", 174: "青", 175: "非", 176: "面", 177: "革", 178: "韋", 179: "韭", 180: "音",
  181: "頁", 182: "風", 183: "飛", 184: "食 (飠)", 185: "首", 186: "香", 187: "馬", 188: "骨", 189: "高", 190: "髟",
  191: "鬥", 192: "鬯", 193: "鬲", 194: "鬼", 195: "魚", 196: "鳥", 197: "鹵", 198: "鹿", 199: "麥", 200: "麻",
  201: "黃", 202: "黍", 203: "黹", 204: "黽", 205: "鼎", 206: "鼓", 207: "鼠", 208: "鼻", 209: "齊", 210: "齒",
  211: "龍", 212: "龜", 213: "龠"
};

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download. Status code: ${response.statusCode}`));
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

function processKanjidic(characterToRadicalMap: Map<string, number>) {
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
    r?: {         // radical info
      s: string;  // symbol
      n: number;  // number
    };
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

      // Extract radical from KANJIDIC2 classical radical map
      const radNum = characterToRadicalMap.get(kanji);
      const radSymbol = radNum ? RADICAL_SYMBOLS[radNum] : undefined;
      const radical = radNum && radSymbol ? { s: radSymbol, n: radNum } : undefined;

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
    // 1. Download KANJIDIC2 XML and build radical mapping
    let xml = '';
    try {
      const tempGz = path.join(__dirname, 'kanjidic2_temp.xml.gz');
      console.log('Downloading KANJIDIC2 XML from EDRDG...');
      await downloadFile(KANJIDIC2_URL, tempGz);
      console.log('Decompressing KANJIDIC2 XML...');
      const gzData = fs.readFileSync(tempGz);
      xml = zlib.gunzipSync(gzData).toString('utf8');
      fs.unlinkSync(tempGz);
    } catch (error) {
      console.warn('Failed to download from EDRDG, trying GitHub mirror...', error);
      const tempXml = path.join(__dirname, 'kanjidic2_mirror.xml');
      await downloadFile(KANJIDIC2_MIRROR_URL, tempXml);
      xml = fs.readFileSync(tempXml, 'utf8');
      fs.unlinkSync(tempXml);
    }

    console.log('Parsing KANJIDIC2 radicals...');
    const characterRegex = /<character>([\s\S]*?)<\/character>/g;
    const literalRegex = /<literal>(.*?)<\/literal>/;
    const radicalRegex = /<rad_value rad_type="classical">(\d+)<\/rad_value>/;

    const characterToRadicalMap = new Map<string, number>();
    let xmlMatch;
    while ((xmlMatch = characterRegex.exec(xml)) !== null) {
      const content = xmlMatch[1];
      const literalMatch = literalRegex.exec(content);
      const radMatch = radicalRegex.exec(content);
      if (literalMatch && radMatch) {
        const kanji = literalMatch[1];
        const radNum = parseInt(radMatch[1], 10);
        characterToRadicalMap.set(kanji, radNum);
      }
    }
    console.log(`Parsed ${characterToRadicalMap.size} kanji radical mappings.`);

    // 2. Download Yomichan KANJIDIC english zip and compile buckets
    console.log('Downloading KANJIDIC2 English dataset...');
    await downloadFile(KANJI_URL, TEMP_ZIP);
    processKanjidic(characterToRadicalMap);
  } catch (error) {
    console.error('Error compiling KANJIDIC:', error);
    process.exit(1);
  }
}

main();
