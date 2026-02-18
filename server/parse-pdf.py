from PyPDF2 import PdfReader

r = PdfReader(r'c:\Projeto Code IA\fncd-capital\DOC\CONTRATO.pdf')
with open('pdf-text.txt', 'w', encoding='utf-8') as f:
    f.write(f'Total Pages: {len(r.pages)}\n')
    for i, p in enumerate(r.pages):
        f.write(f'\n\n========== PAGE {i+1} ==========\n\n')
        text = p.extract_text()
        if text:
            f.write(text)
        else:
            f.write('[no text extracted]')
print('Done! Written to pdf-text.txt')
