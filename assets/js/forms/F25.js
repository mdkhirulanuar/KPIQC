import { computeLotSize, getCodeLetter, getPlan, decide, needsFullInspection } from '../aql.js';
import { Parts } from '../data/catalog.js';
import { putRecord } from '../db.js';
import { exportPDF, exportCSV } from '../exporter.js';

export function initF25(section) {
  const partEl = section.querySelector('#f25-part');
  const descEl = section.querySelector('#f25-desc');
  const boxesEl = section.querySelector('#f25-boxes');
  const pcsEl = section.querySelector('#f25-pcsPerBox');
  const lotEl = section.querySelector('#f25-lot');
  const aqlEl = section.querySelector('#f25-aql');
  const codeEl = section.querySelector('#f25-code');
  const nEl = section.querySelector('#f25-n');
  const acEl = section.querySelector('#f25-ac');
  const reEl = section.querySelector('#f25-re');
  const foundEl = section.querySelector('#f25-found');
  const verdictEl = section.querySelector('#f25-verdict');
  const tipEl = section.querySelector('#f25-tip');

  function updateLot() {
    const lot = computeLotSize({ boxes: boxesEl.value, pcsPerBox: pcsEl.value });
    lotEl.value = lot ?? '';
    updatePlan();
  }

  function updatePlan() {
    const lot = parseInt(lotEl.value || '0', 10);
    const aql = aqlEl.value;
    const code = getCodeLetter(lot);
    codeEl.value = code || '';
    const plan = code ? getPlan(code, aql) : null;
    if (plan) {
      nEl.value = plan.n;
      acEl.value = plan.Ac;
      reEl.value = plan.Re;
      tipEl.textContent = needsFullInspection(plan.n, lot) ? 'Sample size ≥ lot size → 100% inspection suggested.' : '';
    } else {
      nEl.value = acEl.value = reEl.value = '';
      tipEl.textContent = '';
    }
    updateDecision();
  }

  function updateDecision() {
    const f = parseInt(foundEl.value || '0', 10);
    const Ac = parseInt(acEl.value || '0', 10);
    const Re = parseInt(reEl.value || '0', 10);
    verdictEl.value = (acEl.value && reEl.value) ? decide(f, Ac, Re) : '';
  }

  boxesEl.addEventListener('input', updateLot);
  pcsEl.addEventListener('input', updateLot);
  aqlEl.addEventListener('change', updatePlan);
  foundEl.addEventListener('input', updateDecision);

  // initial
  updateLot();

  // fill part select with dummy list
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

  // save
  section.querySelector('#f25-save').addEventListener('click', async () => {
    const record = {
      id: crypto.randomUUID(),
      form: 'F25',
      createdAt: new Date().toISOString(),
      part: partEl.value,
      desc: descEl.value,
      boxes: boxesEl.value,
      pcs: pcsEl.value,
      lot: lotEl.value,
      aql: aqlEl.value,
      code: codeEl.value,
      sample: nEl.value,
      ac: acEl.value,
      re: reEl.value,
      found: foundEl.value,
      decision: verdictEl.value
    };
    await putRecord('F25', record);
    alert('Record saved locally.');
  });

  // export PDF
  section.querySelector('#f25-export-pdf').addEventListener('click', async () => {
    const metaFields = {
      'Part': partEl.value,
      'Description': descEl.value,
      '# Boxes': boxesEl.value,
      'Pcs/Box': pcsEl.value,
      'Lot Size': lotEl.value,
      'AQL': aqlEl.value,
      'Code': codeEl.value,
      'Sample Size': nEl.value,
      'Ac/Re': `${acEl.value}/${reEl.value}`,
      'Defects Found': foundEl.value,
      'Decision': verdictEl.value
    };
    const sections = [];
    await exportPDF({
      title: 'AQL Sampling Record',
      formCode: 'F25',
      metaFields,
      sections,
      meta: { formCode: 'F25', part: partEl.value, lot: lotEl.value }
    });
  });

  // export CSV
  section.querySelector('#f25-export-csv').addEventListener('click', async () => {
    const headers = ['part','desc','boxes','pcs','lot','aql','code','sample','ac','re','found','decision'];
    const row = {
      part: partEl.value,
      desc: descEl.value,
      boxes: boxesEl.value,
      pcs: pcsEl.value,
      lot: lotEl.value,
      aql: aqlEl.value,
      code: codeEl.value,
      sample: nEl.value,
      ac: acEl.value,
      re: reEl.value,
      found: foundEl.value,
      decision: verdictEl.value
    };
    await exportCSV(headers, [row], { formCode: 'F25', part: partEl.value, lot: lotEl.value });
  });
}