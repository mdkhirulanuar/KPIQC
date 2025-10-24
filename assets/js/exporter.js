import { makeFilename } from './filename.js';
// PDF/CSV exporters using jsPDF, autotable, html2canvas (loaded globally)

export async function exportCSV(headers, rows, meta) {
  const lines = [];
  lines.push(headers.join(','));
  rows.forEach(row => {
    const values = headers.map(h => JSON.stringify(row[h] ?? ''));
    lines.push(values.join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = makeFilename({ ...meta, ext: 'csv' });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function exportPDF({ title, formCode, metaFields, sections, meta }) {
  const doc = new jspdf.jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFontSize(14);
  doc.text(title, 40, 40);
  // meta table
  const metaRows = Object.entries(metaFields).map(([k,v]) => [k, v]);
  doc.autoTable({
    startY: 55,
    head: [['Field','Value']],
    body: metaRows,
    styles: { fontSize: 8 },
    theme: 'grid',
  });
  let y = doc.lastAutoTable.finalY + 10;
  sections.forEach(section => {
    doc.setFontSize(10);
    doc.text(section.heading, 40, y);
    y += 5;
    if (section.table) {
      doc.autoTable({
        startY: y,
        head: [section.table.head],
        body: section.table.body,
        styles: { fontSize: 7 },
        theme: 'grid'
      });
      y = doc.lastAutoTable.finalY + 10;
    }
    if (section.paragraph) {
      const lines = doc.splitTextToSize(section.paragraph, 520);
      doc.text(lines, 40, y);
      y += lines.length * 10;
    }
  });
  doc.save(makeFilename({ ...meta, formCode, ext: 'pdf' }));
}