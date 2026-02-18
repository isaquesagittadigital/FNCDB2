import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import fs from 'fs';

const buf = fs.readFileSync('../DOC/CONTRATO.pdf');
const data = await pdfParse(buf);
console.log('PAGES:', data.numpages);
console.log('--- TEXT ---');
console.log(data.text);
