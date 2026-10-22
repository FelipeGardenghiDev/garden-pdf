export type PdfTool = 'merge' | 'split' | 'rotate' | 'watermark' | 'compress' | 'reorder';

export interface UploadedPdf {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  bytes: Uint8Array;
}

export interface OptimizationResult {
  bytes: Uint8Array;
  originalSize: number;
  optimizedSize: number;
  savedPercentage: number;
}
