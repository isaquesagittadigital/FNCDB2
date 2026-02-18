const pdf = require('pdf-parse/lib/pdf-parse.js');
const fs = require('fs');
const buf = fs.readFileSync('../DOC/CONTRATO.pdf');
pdf(buf).then(d => {
    console.log('PAGES:', d.numpages);
    console.log('--- TEXT ---');
    console.log(d.text);
}).catch(e => console.error('ERROR:', e.message));
