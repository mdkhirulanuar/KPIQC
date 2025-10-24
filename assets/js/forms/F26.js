import { computeLotSize, getCodeLetter, getPlan, needsFullInspection } from '../aql.js';
import { putRecord } from '../db.js';
import { exportPDF, exportCSV } from '../exporter.js';
import { Parts } from '../data/catalog.js';

export function initF26(section) {
  const poEl = section.querySelector('#f26-po');
  const doEl = section.querySelector('#f26-do');
  const partEl = section.querySelector('#f26-part');
  const descEl = section.querySelector('#f26-desc');
  const boxesEl = section.querySelector('#f26-boxes');
  const pcsEl = section.querySelector('#f26-pcs');
  const lotEl = section.querySelector('#f26-lot');
  const aqlEl = section.querySelector('#f26-aql');
  const codeEl = section.querySelector('#f26-code');
  const nEl = section.querySelector('#f26-n');
  const acEl = section.querySelector('#f26-ac');
  const reEl = section.querySelector('#f26-re');
  const tipEl = section.querySelector('#f26-tip');

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
  }
  boxesEl.addEventListener('input', updateLot);
  pcsEl.addEventListener('input', updateLot);
  aqlEl.addEventListener('change', updatePlan);
  updateLot();

  // fill part select with dummy parts
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

  section.querySelector('#f26-save').addEventListener('click', async () => {
    const record = {
      id: crypto.randomUUID(),
      form: 'F26',
      createdAt: new Date().toISOString(),
      po: poEl.value,
      do: doEl.value,
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
      doc: {
        coa: section.querySelector('#f26-doc-coa').checked,
        plate: section.querySelector('#f26-doc-plate').checked,
        spec: section.querySelector('#f26-doc-spec').checked
      },
      physical: {
        packaging: section.querySelector('#f26-packaging').checked,
        appearance: section.querySelector('#f26-appearance').checked,
        dimension: section.querySelector('#f26-dimension').checked
      },
      disposition: section.querySelector('input[name="f26-disp"]:checked')?.value || '',
      remarks: section.querySelector('#f26-remarks').value
    };
    await putRecord('F26', record);
    alert('Record saved.');
  });
  section.querySelector('#f26-export-pdf').addEventListener('click', async () => {
    const metaFields = {
      'PO': poEl.value,
      'DO/Invoice': doEl.value,
      'Part': partEl.value,
      'Description': descEl.value,
      '# Boxes': boxesEl.value,
      'Pcs/Box': pcsEl.value,
      'Lot Size': lotEl.value,
      'AQL': aqlEl.value,
      'Code': codeEl.value,
      'Sample Size': nEl.value,
      'Ac/Re': `${acEl.value}/${reEl.value}`,
      'Disposition': section.querySelector('input[name="f26-disp"]:checked')?.value || ''
    };
    const sections = [
      {
        heading: 'Document Verification',
        table: {
          head: ['Check','Status'],
          body: [
            ['COA/MSDS', section.querySelector('#f26-doc-coa').checked ? 'Yes' : 'No'],
            ['Color Plate', section.querySelector('#f26-doc-plate').checked ? 'Yes' : 'No'],
            ['Spec Sheet', section.querySelector('#f26-doc-spec').checked ? 'Yes' : 'No']
          ]
        }
      },
      {
        heading: 'Physical Check',
        table: {
          head: ['Check','Status'],
          body: [
            ['Packaging OK', section.querySelector('#f26-packaging').checked ? 'Yes' : 'No'],
            ['Appearance OK', section.querySelector('#f26-appearance').checked ? 'Yes' : 'No'],
            ['Dimension OK', section.querySelector('#f26-dimension').checked ? 'Yes' : 'No']
          ]
        }
      },
      {
        heading: 'Remarks',
        paragraph: section.querySelector('#f26-remarks').value || '-'
      }
    ];
    await exportPDF({
      title: 'Incoming Material Control',
      formCode: 'F26',
      metaFields,
      sections,
      meta: { formCode: 'F26', part: partEl.value, lot: lotEl.value }
    });
  });
  section.querySelector('#f26-export-csv').addEventListener('click', async () => {
    const headers = ['po','do','part','desc','boxes','pcs','lot','aql','code','sample','ac','re','coa','plate','spec','packaging','appearance','dimension','disposition','remarks'];
    const row = {
      po: poEl.value,
      do: doEl.value,
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
      coa: section.querySelector('#f26-doc-coa').checked,
      plate: section.querySelector('#f26-doc-plate').checked,
      spec: section.querySelector('#f26-doc-spec').checked,
      packaging: section.querySelector('#f26-packaging').checked,
      appearance: section.querySelector('#f26-appearance').checked,
      dimension: section.querySelector('#f26-dimension').checked,
      disposition: section.querySelector('input[name="f26-disp"]:checked')?.value || '',
      remarks: section.querySelector('#f26-remarks').value
    };
    await exportCSV(headers, [row], { formCode: 'F26', part: partEl.value, lot: lotEl.value });
  });
}