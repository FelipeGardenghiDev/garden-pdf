import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

/**
 * Merges multiple PDF byte arrays into a single unified PDF.
 * 100% Client-side, free and private.
 */
export async function mergePdfs(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Extracts specified 0-based page indices into a new PDF.
 */
export async function extractPages(pdfBuffer: Uint8Array, pageIndices: number[]): Promise<Uint8Array> {
  const srcPdf = await PDFDocument.load(pdfBuffer);
  const newPdf = await PDFDocument.create();

  const validIndices = pageIndices.filter((idx) => idx >= 0 && idx < srcPdf.getPageCount());
  const copiedPages = await newPdf.copyPages(srcPdf, validIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Rotates pages by a given angle (90, 180, 270 degrees).
 */
export async function rotatePages(
  pdfBuffer: Uint8Array,
  rotationAngle: number,
  targetIndices?: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const total = pdfDoc.getPageCount();

  const indicesToRotate = targetIndices || Array.from({ length: total }, (_, i) => i);

  for (const idx of indicesToRotate) {
    if (idx >= 0 && idx < total) {
      const page = pdfDoc.getPage(idx);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationAngle) % 360));
    }
  }

  return await pdfDoc.save();
}

/**
 * Adds diagonal watermark text across all pages.
 */
export async function addWatermark(
  pdfBuffer: Uint8Array,
  text: string,
  opacity: number = 0.25
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font,
      color: rgb(0.85, 0.2, 0.2),
      opacity,
      rotate: degrees(45),
    });
  }

  return await pdfDoc.save();
}

/**
 * Generates a clean synthetic PDF for testing or demo purposes.
 */
export async function createSamplePdf(title = 'Documento de Teste'): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { height } = page.getSize();

  page.drawText(title, {
    x: 50,
    y: height - 80,
    size: 24,
    font: boldFont,
    color: rgb(0.06, 0.72, 0.51), // Emerald
  });

  page.drawText('Gerado localmente no Garden PDF - 100% Client-Side & Privado.', {
    x: 50,
    y: height - 120,
    size: 12,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText('Este arquivo foi criado em memória via pdf-lib no seu próprio navegador.', {
    x: 50,
    y: height - 145,
    size: 11,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  return await pdfDoc.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
