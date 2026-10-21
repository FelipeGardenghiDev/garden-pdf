import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  createSamplePdf,
  mergePdfs,
  extractPages,
  rotatePages,
  addWatermark,
} from '../src/core/pdf-engine';

describe('Garden PDF Engine (Client-Side & Offline-First)', () => {
  it('creates a valid sample PDF with 1 page', async () => {
    const bytes = await createSamplePdf('Sample Contract');
    expect(bytes).toBeDefined();
    expect(bytes.length).toBeGreaterThan(0);

    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it('merges multiple PDFs into one unified document', async () => {
    const pdf1 = await createSamplePdf('Doc 1');
    const pdf2 = await createSamplePdf('Doc 2');
    const pdf3 = await createSamplePdf('Doc 3');

    const mergedBytes = await mergePdfs([pdf1, pdf2, pdf3]);
    const mergedDoc = await PDFDocument.load(mergedBytes);

    expect(mergedDoc.getPageCount()).toBe(3);
  });

  it('extracts selected pages from a document', async () => {
    const pdf1 = await createSamplePdf('Doc 1');
    const pdf2 = await createSamplePdf('Doc 2');
    const pdf3 = await createSamplePdf('Doc 3');
    const mergedBytes = await mergePdfs([pdf1, pdf2, pdf3]);

    // Extract pages 0 and 2
    const extractedBytes = await extractPages(mergedBytes, [0, 2]);
    const extractedDoc = await PDFDocument.load(extractedBytes);

    expect(extractedDoc.getPageCount()).toBe(2);
  });

  it('rotates pages correctly', async () => {
    const pdf = await createSamplePdf('Rotated Doc');
    const rotatedBytes = await rotatePages(pdf, 90, [0]);
    const rotatedDoc = await PDFDocument.load(rotatedBytes);

    const page = rotatedDoc.getPage(0);
    expect(page.getRotation().angle).toBe(90);
  });

  it('applies a watermark to pages', async () => {
    const pdf = await createSamplePdf('Watermarked Doc');
    const watermarkedBytes = await addWatermark(pdf, 'CONFIDENCIAL', 0.5);
    const watermarkedDoc = await PDFDocument.load(watermarkedBytes);

    expect(watermarkedDoc.getPageCount()).toBe(1);
    expect(watermarkedBytes.length).toBeGreaterThan(pdf.length);
  });
});
