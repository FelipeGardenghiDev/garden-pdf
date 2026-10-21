export type PdfTool = 'merge' | 'split' | 'rotate' | 'watermark';

export interface UploadedPdf {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  bytes: Uint8Array;
}
