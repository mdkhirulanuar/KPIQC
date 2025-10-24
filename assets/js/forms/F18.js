import { computeLotSize, getCodeLetter, getPlan, needsFullInspection } from '../aql.js';
import { putRecord } from '../db.js';
import { exportPDF, exportCSV } from '../exporter.js';
import { Parts } from '../data/catalog.js';

export function initF18(section) {
  const partEl = section.querySelector('#f18-part');
  const descEl = section.querySelector('#f18-desc');
  const poEl = section.querySelector('#f18-po');
  const lotEl = section.querySelector('#f18-lot');
  const boxesEl = section.querySelector('#f18-boxes');
  const pcsEl = section.querySelector('#f18-pcs');
  const lotSizeEl = section.querySelector('#f18-lotSize');
  const aqlEl = section.querySelector('#f18-aql');
  const codeEl = section.querySelector('#f18-code');
  const nEl = section.querySelector('#f18-n');
  const acEl = section.querySelector('#f18-ac');
  const reEl = section.querySelector('#f18-re');
  const tipEl = section.querySelector('#f18-tip');
  const checksTable = section.querySelector('#f18-checks tbody');
  const funcRadios = section.querySelectorAll('input[name="f18-func"]');
  const dispRadios = section.querySelectorAll('input[name="f18-disp"]');
  const remarksEl = section.querySelector('#f18-remarks');

  function updateLotSize() {
    const size = computeLotSize({ boxes: boxesEl.value, pcsPerBox: pcsEl.value });
    lotSizeEl.value = size ?? '';
    updatePlan();
  }

  function updatePlan() {
    const lotSize = parseInt(lotSizeEl.value || '0', 10);
    const aql = aqlEl.value;
    const code = getCodeLetter(lotSize);
    codeEl.value = code || '';
    const plan = code ? getPlan(code, aql) : null;
    if (plan) {
      nEl.value = plan.n;
      acEl.value = plan.Ac;
      reEl.value = plan.Re;
      tipEl.textContent = needsFullInspection(plan.n, lotSize) ? 'Sample size ≥ lot size → 100% inspection suggested.' : '';
    } else {
      nEl.value = acEl.value = reEl.value = '';
      tipEl.textContent = '';
    }
  }

  boxesEl.addEventListener('input', updateLotSize);
  pcsEl.addEventListener('input', updateLotSize);
  aqlEl.addEventListener('change', updatePlan);
  updateLotSize();

  // fill part select with mock parts
  function fillSelect(sel, arr) {
    sel.innerHTML = '';
    arr.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      sel.appendChild(opt);
    });
  }
  fillSelect(partEl, Parts);

  function readChecks() {
    const rows = [];
    checksTable.querySelectorAll('tr').forEach(tr => {
      const checkpoint = tr.children[0].textContent;
      const res = tr.querySelector('.f18-res')?.value || '';
      const remark = tr.querySelector('.f18-remark')?.value || '';
      rows.push([checkpoint, res, remark]);
    });
    return rows;
  }

  section.querySelector('#f18-save').addEventListener('click', async () => {
    const record = {
      id: crypto.randomUUID(),
      form: 'F18',
      createdAt: new Date().toISOString(),
      part: partEl.value,
      desc: descEl.value,
      po: poEl.value,
      lot: lotEl.value,
      boxes: boxesEl.value,
      pcs: pcsEl.value,
      lotSize: lotSizeEl.value,
      aql: aqlEl.value,
      code: codeEl.value,
      sample: nEl.value,
      ac: acEl.value,
      re: reEl.value,
      checks: readChecks(),
      functional: Array.from(funcRadios).find(r => r.checked)?.value || '',
      disposition: Array.from(dispRadios).find(r => r.checked)?.value || '',
      remarks: remarksEl.value
    };
    await putRecord('F18', record);
    alert('Final outgoing saved.');
  });

  section.querySelector('#f18-export-pdf').addEventListener('click', async () => {
    const metaFields = {
      'Part': partEl.value,
      'Description': descEl.value,
      'PO/Order No': poEl.value,
      'Lot/Batch': lotEl.value,
      '# Boxes': boxesEl.value,
      'Pcs/Box': pcsEl.value,
      'Lot Size': lotSizeEl.value,
      'AQL': aqlEl.value,
      'Code': codeEl.value,
      'Sample Size': nEl.value,
      'Ac/Re': `${acEl.value}/${reEl.value}`,
      'Functional': Array.from(funcRadios).find(r => r.checked)?.value || '',
      'Disposition': Array.from(dispRadios).find(r => r.checked)?.value || ''
    };
    const sectionsArr = [
      {
        heading: 'Visual & Dimensional',
        table: { head:['Checkpoint','Result','Remarks'], body: readChecks() }
      },
      {
        heading: 'Remarks',
        paragraph: remarksEl.value || '-'
      }
    ];
    await exportPDF({
      title: 'Final Outgoing Inspection & Transfer',
      formCode: 'F18',
      metaFields,
      sections: sectionsArr,
      meta: { formCode: 'F18', part: partEl.value, lot: lotEl.value }
    });
  });

  section.querySelector('#f18-export-csv').addEventListener('click', async () => {
    const rows = readChecks().map(row => ({
      part: partEl.value,
      desc: descEl.value,
      po: poEl.value,
      lot: lotEl.value,
      boxes: boxesEl.value,
      pcs: pcsEl.value,
      lotSize: lotSizeEl.value,
      aql: aqlEl.value,
      code: codeEl.value,
      sample: nEl.value,
      ac: acEl.value,
      re: reEl.value,
      checkpoint: row[0],
      result: row[1],
      remark: row[2],
      functional: Array.from(funcRadios).find(r => r.checked)?.value || '',
      disposition: Array.from(dispRadios).find(r => r.checked)?.value || '',
      remarks: remarksEl.value
    }));
    const headers = ['part','desc','po','lot','boxes','pcs','lotSize','aql','code','sample','ac','re','checkpoint','result','remark','functional','disposition','remarks'];
    await exportCSV(headers, rows, { formCode: 'F18', part: partEl.value, lot: lotEl.value });
  });
}