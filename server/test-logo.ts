import * as fs from 'fs';
import * as path from 'path';
const p1 = path.resolve(__dirname, '../../../public/assets/logos/LogoFonteBranca.png');
const p2 = path.resolve(__dirname, '../../../public/assets/logos/LogoEscura.png');
console.log('p1:', p1, fs.existsSync(p1));
console.log('p2:', p2, fs.existsSync(p2));
