import { X, FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { useState } from 'react';
import { useTrendStore } from '../store/useTrendStore';
import type { Trend } from '../types';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { getFilteredTrends, getTop10 } = useTrendStore();
  const [scope, setScope] = useState<'filtered' | 'top10' | 'all'>('filtered');
  const [includeBrief, setIncludeBrief] = useState(true);
  const [exporting, setExporting] = useState(false);

  const getTrends = (): Trend[] => {
    const { trends } = useTrendStore.getState();
    if (scope === 'top10') return getTop10();
    if (scope === 'all') return trends;
    return getFilteredTrends();
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const trends = getTrends();
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      let y = 20;

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Radar de Tendencias Alimentarias', pageW / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })} · ${trends.length} tendencias${includeBrief ? ' · Con briefs de implementación' : ''}`, pageW / 2, y, { align: 'center' });
      y += 12;

      trends.forEach((t, i) => {
        const blockH = includeBrief ? 80 : 46;
        if (y > 280 - blockH) { doc.addPage(); y = 20; }

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, pageW - 28, blockH, 3, 3, 'F');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`${i + 1}. ${t.name}`, 18, y + 8);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`${t.brand} · ${t.region} · ${t.category} · Score: ${t.score}/100 · Prioridad: ${t.priority} · Complejidad: ${t.complexity}`, 18, y + 14);

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8.5);
        const oppLines = doc.splitTextToSize(t.peruOpportunity, pageW - 40);
        doc.text(oppLines.slice(0, 2), 18, y + 21);

        doc.setTextColor(22, 163, 74);
        const actionLines = doc.splitTextToSize(`→ ${t.suggestedAction}`, pageW - 40);
        doc.text(actionLines.slice(0, 1), 18, y + 33);

        if (includeBrief) {
          doc.setTextColor(29, 78, 216);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('BRIEF:', 18, y + 43);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          const objLines = doc.splitTextToSize(t.brief.objetivo, pageW - 50);
          doc.text(objLines.slice(0, 2), 34, y + 43);

          doc.setTextColor(100, 116, 139);
          doc.setFontSize(7.5);
          doc.text(`Presupuesto: ${t.brief.presupuesto.substring(0, 80)}`, 18, y + 56);
          doc.text(`Timeline: ${t.brief.timeline.substring(0, 80)}`, 18, y + 63);
          const kpiText = `KPIs: ${t.brief.kpis[0]}`;
          doc.text(doc.splitTextToSize(kpiText, pageW - 40)[0], 18, y + 70);
        }

        y += blockH + 6;
      });

      doc.save('radar-tendencias.pdf');
    } finally {
      setExporting(false);
      onClose();
    }
  };

  const exportWord = async () => {
    setExporting(true);
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
      const { saveAs } = await import('file-saver');
      const trends = getTrends();

      const children: any[] = [
        new Paragraph({ text: 'Radar de Tendencias Alimentarias', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({
          children: [new TextRun({ text: `${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })} · ${trends.length} tendencias`, color: '64748B', size: 20 })],
        }),
        new Paragraph({ text: '' }),
      ];

      trends.forEach((t, i) => {
        children.push(
          new Paragraph({ text: `${i + 1}. ${t.name}`, heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ children: [new TextRun({ text: 'Marca: ', bold: true }), new TextRun(`${t.brand}   `), new TextRun({ text: 'Región: ', bold: true }), new TextRun(`${t.region} · ${t.country}   `), new TextRun({ text: 'Score: ', bold: true }), new TextRun(`${t.score}/100   `), new TextRun({ text: 'Prioridad: ', bold: true }), new TextRun(`${t.priority}   `), new TextRun({ text: 'Complejidad: ', bold: true }), new TextRun(`${t.complexity}`)] }),
          new Paragraph({ children: [new TextRun({ text: 'Categoría: ', bold: true }), new TextRun(t.category)] }),
          new Paragraph({ children: [new TextRun({ text: 'Fuente: ', bold: true }), new TextRun(t.sourceType)] }),
          new Paragraph({ children: [new TextRun({ text: 'Evidencia: ', bold: true }), new TextRun(t.evidence)] }),
          new Paragraph({ children: [new TextRun({ text: 'Oportunidad para Perú: ', bold: true }), new TextRun(t.peruOpportunity)] }),
          new Paragraph({ children: [new TextRun({ text: 'Acción sugerida: ', bold: true, color: '16A34A' }), new TextRun({ text: t.suggestedAction, color: '16A34A' })] }),
        );

        if (includeBrief) {
          children.push(
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'BRIEF DE IMPLEMENTACIÓN', heading: HeadingLevel.HEADING_3 }),
            new Paragraph({ children: [new TextRun({ text: 'Objetivo: ', bold: true }), new TextRun(t.brief.objetivo)] }),
            new Paragraph({ children: [new TextRun({ text: 'Público objetivo: ', bold: true }), new TextRun(t.brief.publicoObjetivo)] }),
            new Paragraph({ children: [new TextRun({ text: 'Mensaje clave: ', bold: true }), new TextRun({ text: `"${t.brief.mensajeClave}"`, italics: true })] }),
            new Paragraph({ children: [new TextRun({ text: 'Posicionamiento: ', bold: true }), new TextRun(t.brief.posicionamiento)] }),
            new Paragraph({ children: [new TextRun({ text: 'Canales: ', bold: true }), new TextRun(t.brief.canales.join(' · '))] }),
            new Paragraph({ children: [new TextRun({ text: 'Timeline: ', bold: true }), new TextRun(t.brief.timeline)] }),
            new Paragraph({ children: [new TextRun({ text: 'Presupuesto: ', bold: true }), new TextRun(t.brief.presupuesto)] }),
            new Paragraph({ children: [new TextRun({ text: 'KPIs: ', bold: true }), new TextRun(t.brief.kpis.join(' | '))] }),
          );
        }

        children.push(new Paragraph({ text: '' }));
      });

      const docx = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(docx);
      saveAs(blob, 'radar-tendencias.docx');
    } finally {
      setExporting(false);
      onClose();
    }
  };

  const exportPPTX = async () => {
    setExporting(true);
    try {
      const pptxgen = (await import('pptxgenjs')).default;
      const { saveAs } = await import('file-saver');
      const trends = getTrends();
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_WIDE';

      const cover = pptx.addSlide();
      cover.background = { color: '1E293B' };
      cover.addText('Radar de Tendencias Alimentarias', { x: 1, y: 2.2, w: 11, h: 1.2, fontSize: 36, color: 'FFFFFF', bold: true, align: 'center' });
      cover.addText('TIGO · B&D · Straal · Perú', { x: 1, y: 3.5, w: 11, h: 0.5, fontSize: 18, color: '94A3B8', align: 'center' });
      cover.addText(`${new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}`, { x: 1, y: 4.1, w: 11, h: 0.4, fontSize: 14, color: '64748B', align: 'center' });

      trends.forEach((t) => {
        // Tendencia slide
        const slide = pptx.addSlide();
        slide.background = { color: 'F8FAFC' };
        const scoreColor = t.score >= 80 ? '22C55E' : t.score >= 60 ? 'F59E0B' : 'EF4444';

        slide.addText(t.name, { x: 0.4, y: 0.25, w: 9.5, h: 0.65, fontSize: 20, bold: true, color: '1E293B' });
        slide.addText(`Score: ${t.score}`, { x: 10.5, y: 0.25, w: 2, h: 0.5, fontSize: 20, bold: true, color: scoreColor, align: 'right' });
        slide.addText(`${t.brand} · ${t.region} · ${t.country} · ${t.category} · Prioridad: ${t.priority} · Complejidad: ${t.complexity}`, { x: 0.4, y: 0.95, w: 12.2, h: 0.3, fontSize: 10, color: '64748B' });

        slide.addText('Evidencia', { x: 0.4, y: 1.4, w: 5.8, h: 0.3, fontSize: 11, bold: true, color: '475569' });
        slide.addText(t.evidence, { x: 0.4, y: 1.75, w: 5.8, h: 1.4, fontSize: 9.5, color: '475569', valign: 'top' });
        slide.addText(`Fuente: ${t.sourceType}`, { x: 0.4, y: 3.25, w: 5.8, h: 0.3, fontSize: 9, color: '94A3B8' });

        slide.addShape('rect' as any, { x: 6.5, y: 1.4, w: 6.1, h: 2.2, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } });
        slide.addText('Oportunidad para Perú', { x: 6.7, y: 1.5, w: 5.7, h: 0.35, fontSize: 11, bold: true, color: '1D4ED8' });
        slide.addText(t.peruOpportunity, { x: 6.7, y: 1.9, w: 5.7, h: 1.5, fontSize: 9.5, color: '1E40AF', valign: 'top' });

        slide.addShape('rect' as any, { x: 0.4, y: 3.65, w: 12.2, h: 1.0, fill: { color: 'F0FDF4' }, line: { color: 'BBF7D0', width: 1 } });
        slide.addText('Acción sugerida:', { x: 0.6, y: 3.78, w: 2, h: 0.35, fontSize: 10, bold: true, color: '15803D' });
        slide.addText(t.suggestedAction, { x: 2.8, y: 3.78, w: 9.6, h: 0.7, fontSize: 9.5, color: '166534', valign: 'top' });

        if (includeBrief) {
          const bSlide = pptx.addSlide();
          bSlide.background = { color: 'F0F4FF' };

          bSlide.addText(`Brief: ${t.name}`, { x: 0.4, y: 0.2, w: 12.2, h: 0.55, fontSize: 18, bold: true, color: '1E3A8A' });
          bSlide.addText(`${t.brand} · ${t.region}`, { x: 0.4, y: 0.8, w: 12.2, h: 0.3, fontSize: 11, color: '64748B' });

          bSlide.addShape('rect' as any, { x: 0.4, y: 1.2, w: 12.2, h: 0.75, fill: { color: '1D4ED8' }, line: { color: '1D4ED8', width: 0 } });
          bSlide.addText('OBJETIVO', { x: 0.6, y: 1.25, w: 1.5, h: 0.3, fontSize: 9, bold: true, color: 'BFDBFE' });
          bSlide.addText(t.brief.objetivo, { x: 0.6, y: 1.53, w: 11.8, h: 0.35, fontSize: 8.5, color: 'FFFFFF' });

          bSlide.addText('Público objetivo', { x: 0.4, y: 2.1, w: 5.8, h: 0.3, fontSize: 10, bold: true, color: '475569' });
          bSlide.addText(t.brief.publicoObjetivo, { x: 0.4, y: 2.45, w: 5.8, h: 1.0, fontSize: 8.5, color: '475569', valign: 'top' });

          bSlide.addText('Mensaje clave', { x: 6.5, y: 2.1, w: 6.1, h: 0.3, fontSize: 10, bold: true, color: '475569' });
          bSlide.addText(`"${t.brief.mensajeClave}"`, { x: 6.5, y: 2.45, w: 6.1, h: 0.8, fontSize: 9, color: '1E40AF', valign: 'top', italic: true });

          bSlide.addText('Canales', { x: 0.4, y: 3.55, w: 5.8, h: 0.3, fontSize: 10, bold: true, color: '475569' });
          bSlide.addText(t.brief.canales.map((c) => `• ${c}`).join('\n'), { x: 0.4, y: 3.88, w: 5.8, h: 1.2, fontSize: 8, color: '475569', valign: 'top' });

          bSlide.addText('Timeline & Presupuesto', { x: 6.5, y: 3.55, w: 6.1, h: 0.3, fontSize: 10, bold: true, color: '475569' });
          bSlide.addText(t.brief.timeline, { x: 6.5, y: 3.88, w: 6.1, h: 0.6, fontSize: 8, color: '475569' });
          bSlide.addText(t.brief.presupuesto, { x: 6.5, y: 4.5, w: 6.1, h: 0.4, fontSize: 8, color: '15803D', bold: true });

          bSlide.addText('KPIs de éxito', { x: 0.4, y: 5.1, w: 12.2, h: 0.3, fontSize: 10, bold: true, color: '475569' });
          bSlide.addText(t.brief.kpis.map((k, i) => `${i + 1}. ${k}`).join('   |   '), { x: 0.4, y: 5.45, w: 12.2, h: 0.4, fontSize: 8, color: '475569' });
        }
      });

      const blob = await pptx.stream() as unknown as BlobPart;
      saveAs(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }), 'radar-tendencias.pptx');
    } finally {
      setExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800">Exportar reporte</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium text-slate-600 mb-2">¿Qué tendencias incluir?</div>
          <div className="space-y-2">
            {[
              { value: 'filtered', label: 'Tendencias según filtros actuales' },
              { value: 'top10', label: 'Solo Top 10 oportunidades Perú' },
              { value: 'all', label: 'Todas las tendencias' },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="scope" value={value} checked={scope === value} onChange={() => setScope(value as any)} className="accent-blue-600" />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-5 border-t border-slate-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={includeBrief} onChange={(e) => setIncludeBrief(e.target.checked)} className="accent-blue-600 w-4 h-4" />
            <div>
              <span className="text-sm font-medium text-slate-700">Incluir brief de implementación</span>
              <p className="text-xs text-slate-400">Objetivo, público, mensaje, canales, timeline, presupuesto y KPIs</p>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={exportPDF} disabled={exporting} className="flex flex-col items-center gap-2 p-4 border-2 border-red-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-50">
            <FileText size={24} className="text-red-600" />
            <span className="text-sm font-semibold text-red-700">PDF</span>
          </button>
          <button onClick={exportWord} disabled={exporting} className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50">
            <FileSpreadsheet size={24} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Word</span>
          </button>
          <button onClick={exportPPTX} disabled={exporting} className="flex flex-col items-center gap-2 p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all disabled:opacity-50">
            <Presentation size={24} className="text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">PowerPoint</span>
          </button>
        </div>

        {exporting && <div className="mt-4 text-center text-sm text-slate-500 animate-pulse">Generando reporte...</div>}
      </div>
    </div>
  );
}
