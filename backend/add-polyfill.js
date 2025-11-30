const fs = require('fs');
const path = require('path');

const polyfill = `// --- process polyfill for GAS ---
if (typeof process === 'undefined') {
  var process = {
    env: {},
    argv: [],
    version: '',
    cwd: function () {
      return '';
    }
  };
}
// --- end process polyfill ---
// sentinel to avoid leading IIFE parse issues in GAS
void 0;
`;

const codeJsPath = path.join(__dirname, '../dist/Code.js');

console.log('Looking for Code.js at:', codeJsPath);

// ファイルが存在するか確認
if (!fs.existsSync(codeJsPath)) {
  console.error('❌ Error: Code.js not found at', codeJsPath);
  process.exit(1);
}

console.log('✓ Code.js found');

const originalCode = fs.readFileSync(codeJsPath, 'utf8');
console.log('Original file size:', originalCode.length, 'bytes');
console.log('First 100 characters:', originalCode.substring(0, 100));

// polyfillが既に存在する場合は追加しない
// 先頭が ( で始まる(IIFE)場合 Apps Script 側で稀に SyntaxError になるケースがあるため、
// 既存コード先頭が ( ならセミコロンを追加して安全にする。
const trimmed = originalCode.trimStart();
const needsSemicolon = trimmed.startsWith('(') && !trimmed.startsWith('(;');

if (!originalCode.includes('process polyfill')) {
  const prefix = needsSemicolon ? polyfill + ';' : polyfill;
  let bundled = originalCode;
  // 先頭が即時実行アローIIFEの場合 (()=> を function に書き換え
  const startTrimmed = bundled.trimStart();
  if (startTrimmed.startsWith('(()=>')) {
    // 先頭の (()=> を (function() に置換 (最初の1回のみ)
    bundled = bundled.replace('(())=>', '(function()'); // safety, unlikely pattern
    bundled = bundled.replace('( ()=>', '(function()'); // spacing variant
    bundled = bundled.replace('(()=>', '(function()');
  }
  const newCode = prefix + bundled;
  fs.writeFileSync(codeJsPath, newCode, 'utf8');
  console.log('✓ Process polyfill added to Code.js');
  console.log('New file size:', newCode.length, 'bytes');
  console.log('First 200 characters:', newCode.substring(0, 200));
} else {
  console.log('✓ Process polyfill already exists in Code.js');
}
