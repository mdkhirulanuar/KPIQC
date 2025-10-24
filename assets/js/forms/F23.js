import { putRecord } from '../db.js';
import { exportPDF, exportCSV } from '../exporter.js';
import { DefectTypes, DefectDisposition, Parts } from '../data/catalog.js';

export function initF23(section) {
  const dateEl = section.querySelector('#f23-date');
  const shiftEl = section.querySelector('#f23-shift');
  const partEl = section.querySelector('#f23-part');
  const descEl = section.querySelector('#f23-desc');
  const overallEl = section.querySelector('#f23-overall');
  const remarksEl = section.querySelector('#f23-remarks');
  const tableBody = section.querySelector('#f23-table tbody');
  const addRowBtn = section.querySelector('#f23-add-row');

  function createRow() {
    const tr = document.createElement('tr');
    const defectSelect = document.createElement('select');
    DefectTypes.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      defectSelect.appendChild(opt);
    });
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '0';
    qtyInput.value = '0';
    const dispSelect = document.createElement('select');
    DefectDisposition.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      dispSelect.appendChild(opt);
    });
    const remarkInput = document.createElement('input');
    remarkInput.type = 'text';
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.type = 'button';
    removeBtn.addEventListener('click', () => tr.remove());
    const td0 = document.createElement('td');
    td0.appendChild(defectSelect);
    const td1 = document.createElement('td');
    td1.appendChild(qtyInput);
    const td2 = document.createElement('td');
    td2.appendChild(dispSelect);
    const td3 = document.createElement('td');
    td3.appendChild(remarkInput);
    const td4 = document.createElement('td');
    td4.appendChild(removeBtn);
    tr.append(td0, td1, td2, td3, td4);
    tableBody.appendChild(tr);
  }

  // initial one row
  createRow();
  addRowBtn.addEventListener('click', createRow);

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

  section.querySelector('#f23-save').addEventListener('click', async () => {
    const rows = [];
    tableBody.querySelectorAll('tr').forEach(tr => {
      rows.push({
        defect: tr.children[0].querySelector('select').value,
        qty: tr.children[1].querySelector('input').value,
        disposition: tr.children[2].querySelector('select').value,
        remark: tr.children[3].querySelector('input').value
      });
    });
    const record = {
      id: crypto.randomUUID(),
      form: 'F23',
      createdAt: new Date().toISOString(),
      date: dateEl.value,
      shift: shiftEl.value,
      part: partEl.value,
      desc: descEl.value,
      rows,
      overall: overallEl.value,
      remarks: remarksEl.value
    };
    await putRecord('F23', record);
    alert('Defect log saved.');
  });

  section.querySelector('#f23-export-pdf').addEventListener('click', async () => {
    const metaFields = {
      'Date': dateEl.value,
      'Shift': shiftEl.value,
      'Part': partEl.value,
      'Description': descEl.value,
      'Overall Disposition': overallEl.value
    };
    const body = [];
    tableBody.querySelectorAll('tr').forEach(tr => {
      body.push([
        tr.children[0].querySelector('select').value,
        tr.children[1].querySelector('input').value,
        tr.children[2].querySelector('select').value,
        tr.children[3].querySelector('input').value
      ]);
    });
    const sectionsArr = [
      {
        heading: 'Defect Entries',
        table: { head:['Defect','Qty','Disposition','Remarks'], body }
      },
      {
        heading: 'Remarks',
        paragraph: remarksEl.value || '-'
      }
    ];
    await exportPDF({
      title: 'Defect Record Log',
      formCode: 'F23',
      metaFields,
      sections: sectionsArr,
      meta: { formCode: 'F23', part: partEl.value, lot: dateEl.value }
    });
  });

  section.querySelector('#f23-export-csv').addEventListener('click', async () => {
    const rows = [];
    tableBody.querySelectorAll('tr').forEach(tr => {
      rows.push({
        date: dateEl.value,
        shift: shiftEl.value,
        part: partEl.value,
        desc: descEl.value,
        defect: tr.children[0].querySelector('select').value,
        qty: tr.children[1].querySelector('input').value,
        disposition: tr.children[2].querySelector('select').value,
        remark: tr.children[3].querySelector('input').value,
        overall: overallEl.value,
        remarks: remarksEl.value
      });
    });
    const headers = ['date','shift','part','desc','defect','qty','disposition','remark','overall','remarks'];
    await exportCSV(headers, rows, { formCode: 'F23', part: partEl.value, lot: dateEl.value });
  });
}