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
  ShieldCheck,
  Zap,
  ArrowLeftRight
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { PdfTool, UploadedPdf, OptimizationResult } from './types';
import {
  mergePdfs,
  extractPages,
  rotatePages,
  addWatermark,
  createSamplePdf,
  downloadPdf,
  optimizePdf,
  reorderPages
} from './core/pdf-engine';

export const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<PdfTool>('merge');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedPdf[]>([]);
  const [splitRange, setSplitRange] = useState<string>('1');
  const [rotationDegrees, setRotationDegrees] = useState<number>(90);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENCIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [optimizationStats, setOptimizationStats] = useState<OptimizationResult | null>(null);
  const [reorderList, setReorderList] = useState<number[]>([]);

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

    setUploadedFiles((prev) => {
      const combined = [...prev, ...newUploaded];
      if (combined.length > 0 && reorderList.length === 0) {
        setReorderList(Array.from({ length: combined[0].pageCount }, (_, idx) => idx));
      }
      return combined;
    });
  };

  const handleLoadDemoPdf = async () => {
    try {
      const sample = await createSamplePdf('Contrato Exemplo Garden');
      const doc = await PDFDocument.load(sample);
      const demo: UploadedPdf = {
        id: `pdf_sample_${Date.now()}`,
        name: 'exemplo_garden.pdf',
        size: sample.length,
        pageCount: doc.getPageCount(),
        bytes: sample,
      };
      setUploadedFiles([demo]);
      setReorderList(Array.from({ length: demo.pageCount }, (_, idx) => idx));
    } catch (err) {
      console.error('Failed to create sample PDF:', err);
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    setUploadedFiles((prev) => {
      const copy = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleMerge = async () => {
    if (uploadedFiles.length < 2) return;
    try {
      setIsProcessing(true);
      const buffers = uploadedFiles.map((f) => f.bytes);
      const mergedBytes = await mergePdfs(buffers);
      downloadPdf(mergedBytes, 'garden_documentos_unificados.pdf');
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
      const pagesToExtract = splitRange
        .split(',')
        .map((p) => parseInt(p.trim(), 10) - 1)
        .filter((idx) => !isNaN(idx));

      const extractedBytes = await extractPages(target.bytes, pagesToExtract);
      downloadPdf(extractedBytes, `${target.name.replace(/\.[^/.]+$/, '')}_paginas_extraidas.pdf`);
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
      downloadPdf(rotatedBytes, `${target.name.replace(/\.[^/.]+$/, '')}_rotacionado.pdf`);
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

  const handleCompress = async () => {
    if (uploadedFiles.length === 0) return;
    try {
      setIsProcessing(true);
      const target = uploadedFiles[0];
      const result = await optimizePdf(target.bytes);
      setOptimizationStats(result);
      downloadPdf(result.bytes, `${target.name.replace(/\.[^/.]+$/, '')}_comprimido.pdf`);
    } catch (err) {
      console.error('Compress error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReorder = async () => {
    if (uploadedFiles.length === 0) return;
    try {
      setIsProcessing(true);
      const target = uploadedFiles[0];
      const reorderedBytes = await reorderPages(target.bytes, reorderList);
      downloadPdf(reorderedBytes, `${target.name.replace(/\.[^/.]+$/, '')}_reordenado.pdf`);
    } catch (err) {
      console.error('Reorder error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    setReorderList((prev) => {
      const copy = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Carregar PDF de Teste
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* Tool Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <button
            onClick={() => setActiveTool('merge')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTool === 'merge'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Copy className="w-4 h-4" />
            Juntar
          </button>

          <button
            onClick={() => setActiveTool('split')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTool === 'split'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Scissors className="w-4 h-4" />
            Extrair
          </button>

          <button
            onClick={() => setActiveTool('rotate')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTool === 'rotate'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            Girar
          </button>

          <button
            onClick={() => setActiveTool('watermark')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTool === 'watermark'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Stamp className="w-4 h-4" />
            Marca d'Água
          </button>

          <button
            onClick={() => setActiveTool('compress')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTool === 'compress'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Comprimir
          </button>

          <button
            onClick={() => setActiveTool('reorder')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTool === 'reorder'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
            Reordenar
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
            <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center text-emerald-400 transition">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                Clique para selecionar ou arraste seus PDFs aqui
              </p>
              <p className="text-xs text-zinc-500">
                Processamento 100% no seu dispositivo. Nenhum arquivo sai da sua máquina.
              </p>
            </div>
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
            <h2 className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider flex items-center justify-between">
              <span>Arquivos Carregados ({uploadedFiles.length})</span>
              <button
                onClick={() => setUploadedFiles([])}
                className="text-red-400 hover:text-red-300 text-xs normal-case cursor-pointer"
              >
                Limpar todos
              </button>
            </h2>

            <div className="divide-y divide-zinc-800">
              {uploadedFiles.map((file, idx) => (
                <div key={file.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 truncate">
                    <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-zinc-200 truncate">{file.name}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {file.pageCount} página(s) • {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {activeTool === 'merge' && (
                      <>
                        <button
                          onClick={() => handleMoveFile(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                          title="Mover para Cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <button
                          onClick={() => handleMoveFile(idx, 'down')}
                          disabled={idx === uploadedFiles.length - 1}
                          className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                          title="Mover para Baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 rounded hover:bg-red-950 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons based on Active Tool */}
            {activeTool === 'merge' && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleMerge}
                  disabled={uploadedFiles.length < 2 || isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-40 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  {isProcessing ? 'Unificando...' : 'Juntar PDFs & Baixar'}
                </button>
              </div>
            )}

            {activeTool === 'split' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-zinc-300">Páginas a extrair (ex: 1, 3):</label>
                  <input
                    type="text"
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    placeholder="1, 2, 3"
                    className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-40 cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  {isProcessing ? 'Extraindo...' : 'Extrair & Baixar PDF'}
                </button>
              </div>
            )}

            {activeTool === 'rotate' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-zinc-300">Ângulo de rotação:</label>
                  <select
                    value={rotationDegrees}
                    onChange={(e) => setRotationDegrees(parseInt(e.target.value, 10))}
                    className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={90}>90° Horário</option>
                    <option value={180}>180° Invertido</option>
                    <option value={270}>270° Anti-horário</option>
                  </select>
                </div>
                <button
                  onClick={handleRotate}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-40 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                  {isProcessing ? 'Girando...' : 'Girar & Baixar PDF'}
                </button>
              </div>
            )}

            {activeTool === 'watermark' && (
              <div className="flex flex-col gap-3 pt-2">
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
                      className="h-2 bg-zinc-800 rounded accent-emerald-500 mt-2 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleWatermark}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-40 cursor-pointer"
                  >
                    <Stamp className="w-4 h-4" />
                    {isProcessing ? 'Aplicando...' : 'Aplicar Marca & Baixar'}
                  </button>
                </div>
              </div>
            )}

            {activeTool === 'compress' && (
              <div className="flex flex-col gap-3 pt-2">
                <p className="text-xs text-zinc-400">
                  Otimiza a estrutura interna do PDF compactando streams de objetos e removendo duplicatas de metadados.
                </p>
                {optimizationStats && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-zinc-400">Tamanho original: </span>
                      <span className="font-mono text-zinc-200">{(optimizationStats.originalSize / 1024).toFixed(1)} KB</span>
                      <span className="mx-2">➔</span>
                      <span className="text-zinc-400">Otimizado: </span>
                      <span className="font-mono text-emerald-400 font-bold">{(optimizationStats.optimizedSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[11px]">
                      -{optimizationStats.savedPercentage}%
                    </span>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCompress}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-40 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    {isProcessing ? 'Comprimindo...' : 'Comprimir & Baixar PDF'}
                  </button>
                </div>
              </div>
            )}

            {activeTool === 'reorder' && (
              <div className="flex flex-col gap-3 pt-2">
                <p className="text-xs text-zinc-400">
                  Reordene as páginas do documento movendo-as para cima ou para baixo:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {reorderList.map((pageIdx, i) => (
                    <div
                      key={`page_${pageIdx}_${i}`}
                      className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono font-bold text-zinc-200">Pág. {pageIdx + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => movePage(i, 'up')}
                          disabled={i === 0}
                          className="p-1 rounded hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-zinc-300" />
                        </button>
                        <button
                          onClick={() => movePage(i, 'down')}
                          disabled={i === reorderList.length - 1}
                          className="p-1 rounded hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-zinc-300" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleReorder}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-40 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {isProcessing ? 'Reordenando...' : 'Salvar Nova Ordem'}
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
