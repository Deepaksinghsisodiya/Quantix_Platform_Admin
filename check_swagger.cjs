const fs = require('fs');
let content = fs.readFileSync('swagger.json');
// Check BOM for UTF-16LE
let jsonStr;
if (content[0] === 0xFF && content[1] === 0xFE) {
  jsonStr = content.toString('utf16le');
} else {
  jsonStr = content.toString('utf8');
}
// Strip BOM if present
if (jsonStr.charCodeAt(0) === 0xFEFF) {
  jsonStr = jsonStr.substring(1);
}
const swagger = JSON.parse(jsonStr);
const paths = Object.keys(swagger.paths);
console.log('--- Paths containing deboarding ---');
console.log(paths.filter(p => p.toLowerCase().includes('deboarding')));
console.log('--- Paths containing terminals ---');
console.log(paths.filter(p => p.toLowerCase().includes('terminals')));
