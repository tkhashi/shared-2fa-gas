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
const originalCode = fs.readFileSync(codeJsPath, 'utf8');

// polyfillが既に存在する場合は追加しない
if (!originalCode.includes('process polyfill')) {
  const newCode = polyfill + originalCode;
  fs.writeFileSync(codeJsPath, newCode, 'utf8');
  console.log('✓ Process polyfill added to Code.js');
} else {
  console.log('✓ Process polyfill already exists in Code.js');
}
