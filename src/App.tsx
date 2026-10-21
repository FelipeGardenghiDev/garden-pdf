import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Scissors,
  RotateCw,
  Stamp,
  Upload,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { PdfTool, UploadedPdf } from './types';
import {
  mergePdfs,
  extractPages,
  rotatePages,
  addWatermark,
  createSamplePdf,
  downloadPdf
} from './core/pdf-engine';

export const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<PdfTool>('merge');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedPdf[]>([]);
  const [splitRange, setSplitRange] = useState<string>('1');
  const [rotationDegrees, setRotationDegrees] = useState<number>(90);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENCIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUploaded: UploadedPdf[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const doc = await PDFDocument.load(bytes);
        newUploaded.push({
          id: `pdf_${Date.now()}_${i}`,
          name: file.name,
          size: file.size,
          pageCount: doc.getPageCount(),
          bytes,
        });
      } catch (err) {
        console.error('Failed to load PDF:', file.name, err);
      }
    }

    setUploadedFiles((prev) => [...prev, ...newUploaded]);
    e.target.value = '';
  };

  // Demo File Loader
  const handleLoadDemoPdf = async () => {
    try {
      const demoBytes = await createSamplePdf('Documento Demo - Garden PDF');
      const doc = await PDFDocument.load(demoBytes);
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: `pdf_demo_${Date.now()}`,
          name: 'garden_demo_sample.pdf',
          size: demoBytes.length,
          pageCount: doc.getPageCount(),
          bytes: demoBytes,
        },
      ]);
    } catch (err) {
      console.error('Demo error:', err);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= uploadedFiles.length) return;
    const reordered = [...uploadedFiles];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setUploadedFiles(reordered);
  };

  // Actions
  const handleMerge = async () => {
    if (uploadedFiles.length < 2) return;
    try {
      setIsProcessing(true);
      const mergedBytes = await mergePdfs(uploadedFiles.map((f) => f.bytes));
      downloadPdf(mergedBytes, 'garden_merged.pdf');
    } catch (err) {
      console.error('Merge error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplit = async () => {
    if (uploadedFiles.length === 0) return;
    try {
      setIsProcessing(true);
      const target = uploadedFiles[0];
      // Parse range string (e.g. "1, 3, 5-7")
      const pagesToExtract: number[] = [];
      const parts = splitRange.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim(), 10));
          if (!isNaN(start) && !isNaN(end)) {
            for (let p = start; p <= end; p++) {
              pagesToExtract.push(p - 1); // 0-based index
            }
          }
        } else {
          const p = parseInt(trimmed, 10);
          if (!isNaN(p)) pagesToExtract.push(p - 1);
        }
      }

      const extractedBytes = await extractPages(target.bytes, pagesToExtract);
      downloadPdf(extractedBytes, `${target.name.replace(/\.[^/.]+$/, '')}_extraido.pdf`);
    } catch (err) {
      console.error('Split error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotate = async () => {
    if (uploadedFiles.length === 0) return;
    try {
      setIsProcessing(true);
      const target = uploadedFiles[0];
      const rotatedBytes = await rotatePages(target.bytes, rotationDegrees);
      downloadPdf(rotatedBytes, `${target.name.replace(/\.[^/.]+$/, '')}_girado.pdf`);
    } catch (err) {
      console.error('Rotate error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWatermark = async () => {
    if (uploadedFiles.length === 0) return;
    try {
      setIsProcessing(true);
      const target = uploadedFiles[0];
      const watermarkedBytes = await addWatermark(target.bytes, watermarkText, watermarkOpacity);
      downloadPdf(watermarkedBytes, `${target.name.replace(/\.[^/.]+$/, '')}_watermark.pdf`);
    } catch (err) {
      console.error('Watermark error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-red-950/40">
            📑
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Garden PDF
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                100% Client-Side
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Canivete Suíço de PDFs no Navegador (Privacidade Total & Gratuito)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadDemoPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Carregar PDF de Teste
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* Tool Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <button
            onClick={() => setActiveTool('merge')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
              activeTool === 'merge'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Copy className="w-4 h-4" />
            Juntar PDFs
          </button>

          <button
            onClick={() => setActiveTool('split')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
              activeTool === 'split'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Scissors className="w-4 h-4" />
            Extrair Páginas
          </button>

          <button
            onClick={() => setActiveTool('rotate')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
              activeTool === 'rotate'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            Girar Páginas
          </button>

          <button
            onClick={() => setActiveTool('watermark')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
              activeTool === 'watermark'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Stamp className="w-4 h-4" />
            Marca d'Água
          </button>
        </div>

        {/* File Upload Zone */}
        <div className="p-6 rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-800 hover:border-zinc-700 transition flex flex-col items-center justify-center text-center gap-3">
          <input
            type="file"
            id="pdf-upload"
            accept="application/pdf"
            multiple={activeTool === 'merge'}
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="pdf-upload"
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 group-hover:bg-zinc-700 text-emerald-400 flex items-center justify-center transition shadow">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-zinc-200">
              Clique para selecionar seus arquivos PDF
            </div>
            <div className="text-xs text-zinc-500">
              {activeTool === 'merge'
                ? 'Selecione 2 ou mais arquivos para juntar em ordem'
                : 'Selecione um arquivo PDF para processar'}
            </div>
          </label>
        </div>

        {/* Uploaded File List */}
        {uploadedFiles.length > 0 && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
              <span>ARQUIVOS SELECIONADOS ({uploadedFiles.length})</span>
              <button
                onClick={() => setUploadedFiles([])}
                className="text-red-400 hover:underline"
              >
                Limpar Todos
              </button>
            </div>

            <div className="space-y-2">
              {uploadedFiles.map((file, idx) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-red-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-100 truncate">{file.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {file.pageCount} página(s) • {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {activeTool === 'merge' && (
                      <>
                        <button
                          onClick={() => moveFile(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveFile(idx, 'down')}
                          disabled={idx === uploadedFiles.length - 1}
                          className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 rounded text-zinc-500 hover:text-red-400 transition"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tool-specific Action Box */}
        {uploadedFiles.length > 0 && (
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md flex flex-col gap-4">
            
            {activeTool === 'merge' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-zinc-400">
                  Os {uploadedFiles.length} arquivos serão concatenados na ordem da lista acima.
                </div>
                <button
                  onClick={handleMerge}
                  disabled={isProcessing || uploadedFiles.length < 2}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  {isProcessing ? 'Processando...' : 'Juntar & Baixar PDF'}
                </button>
              </div>
            )}

            {activeTool === 'split' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-medium text-zinc-300 whitespace-nowrap">
                    Páginas para extrair:
                  </label>
                  <input
                    type="text"
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    placeholder="Ex: 1, 3, 5-8"
                    className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 font-mono w-40 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-40"
                >
                  <Scissors className="w-4 h-4" />
                  {isProcessing ? 'Extraindo...' : 'Extrair & Baixar PDF'}
                </button>
              </div>
            )}

            {activeTool === 'rotate' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-zinc-300">Ângulo de rotação:</label>
                  <select
                    value={rotationDegrees}
                    onChange={(e) => setRotationDegrees(parseInt(e.target.value, 10))}
                    className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value={90}>90° Horário</option>
                    <option value={180}>180° Invertido</option>
                    <option value={270}>270° Anti-horário</option>
                  </select>
                </div>
                <button
                  onClick={handleRotate}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-40"
                >
                  <RotateCw className="w-4 h-4" />
                  {isProcessing ? 'Girando...' : 'Girar & Baixar PDF'}
                </button>
              </div>
            )}

            {activeTool === 'watermark' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-300 font-medium">Texto da Marca d'Água:</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-zinc-300 font-medium">
                      <span>Opacidade:</span>
                      <span className="font-mono text-emerald-400">{Math.round(watermarkOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={0.8}
                      step={0.05}
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                      className="h-2 bg-zinc-800 rounded accent-emerald-500 mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleWatermark}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-40"
                  >
                    <Stamp className="w-4 h-4" />
                    {isProcessing ? 'Aplicando...' : 'Aplicar Marca & Baixar'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
};

export default App;
