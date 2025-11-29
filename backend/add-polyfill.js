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
if (!originalCode.includes('process polyfill')) {
  const newCode = polyfill + originalCode;
  fs.writeFileSync(codeJsPath, newCode, 'utf8');
  console.log('✓ Process polyfill added to Code.js');
  console.log('New file size:', newCode.length, 'bytes');
  console.log('First 200 characters:', newCode.substring(0, 200));
} else {
  console.log('✓ Process polyfill already exists in Code.js');
}
