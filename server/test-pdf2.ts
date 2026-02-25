import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.HelveticaBold);

    const logoBytes = fs.readFileSync(path.resolve(__dirname, '../public/assets/logos/LogoFonteBranca.png'));
    const logoImage = await doc.embedPng(new Uint8Array(logoBytes));

    const drawH = 36;
    const scaleLog = drawH / logoImage.height;
    const drawW = logoImage.width * scaleLog;

    const iconX = 200;
    const iconY = 800;

    page.drawImage(logoImage, {
        x: iconX,
        y: iconY - drawH + 5,
        width: drawW,
        height: drawH,
    });

    page.drawText('FNCD Capital', {
        x: iconX + drawW + 10,
        y: iconY - 14,
        size: 16,
        font,
        color: rgb(0, 43 / 255, 73 / 255)
    });

    fs.writeFileSync('test.pdf', await doc.save());
}
generate().catch(console.error);
