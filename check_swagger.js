const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
const paths = Object.keys(swagger.paths);
console.log('--- Paths containing deboarding ---');
console.log(paths.filter(p => p.includes('deboarding')));
console.log('--- Paths containing terminals ---');
console.log(paths.filter(p => p.includes('terminals')));
