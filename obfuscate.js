const fs = require('fs');
const path = require('path');
const obfuscator = require('javascript-obfuscator');

const buildPath = './build/static/js';

fs.readdirSync(buildPath).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(buildPath, file);
    const code = fs.readFileSync(filePath, 'utf8');
    const obfuscated = obfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      simplify: true,
      stringArrayEncoding: ['base64'],
    });
    fs.writeFileSync(filePath, obfuscated.toString());
  }
});