const fs = require('fs');
let content = fs.readFileSync('swagger.json');
let jsonStr = content[0] === 0xFF && content[1] === 0xFE ? content.toString('utf16le') : content.toString('utf8');
if (jsonStr.charCodeAt(0) === 0xFEFF) jsonStr = jsonStr.substring(1);
const swagger = JSON.parse(jsonStr);
console.log(JSON.stringify(swagger.paths['/api/v1/terminals/by-merchant/{merchantId}'], null, 2));
