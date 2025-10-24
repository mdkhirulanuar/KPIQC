import { putRecord } from '../db.js';
import { exportPDF, exportCSV } from '../exporter.js';
import { Parts, Machines } from '../data/catalog.js';

export function initF27(section) {
  // generate table rows
  const tbody = section.querySelector('#f27-table tbody');
  for (let i = 1; i <= 5; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td><input type="checkbox" class="f27-appear"></td>
      <td><input type="checkbox" class="f27-dim"></td>
      <td><input type="checkbox" class="f27-func"></td>
      <td><input type="text" class="f27-remark"></td>
    `;
    tbody.appendChild(tr);
  }

  const partEl = section.querySelector('#f27-part');
  const revEl = section.querySelector('#f27-rev');
  const machineEl = section.querySelector('#f27-machine');
  const cavityEl = section.querySelector('#f27-cavity');
  const dispEl = section.querySelector('#f27-disp');
  const remarksEl = section.querySelector('#f27-remarks');

  // fill part and machine selects
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
  fillSelect(machineEl, Machines);

  section.querySelector('#f27-save').addEventListener('click', async () => {
    const samples = [];
    section.querySelectorAll('#f27-table tbody tr').forEach((tr, idx) => {
      samples.push({
        sample: idx + 1,
        appearance: tr.querySelector('.f27-appear').checked,
        dimension: tr.querySelector('.f27-dim').checked,
        functional: tr.querySelector('.f27-func').checked,
        remarks: tr.querySelector('.f27-remark').value
      });
    });
    const record = {
      id: crypto.randomUUID(),
      form: 'F27',
      createdAt: new Date().toISOString(),
      part: partEl.value,
      revision: revEl.value,
      machine: machineEl.value,
      cavity: cavityEl.value,
      samples,
      disposition: dispEl.value,
      remarks: remarksEl.value
    };
    await putRecord('F27', record);
    alert('FAI record saved.');
  });

  section.querySelector('#f27-export-pdf').addEventListener('click', async () => {
    const metaFields = {
      'Part': partEl.value,
      'Revision': revEl.value,
      'Machine': machineEl.value,
      'Cavity': cavityEl.value,
      'Disposition': dispEl.value
    };
    const body = [];
    section.querySelectorAll('#f27-table tbody tr').forEach((tr, idx) => {
      body.push([
        idx + 1,
        tr.querySelector('.f27-appear').checked ? 'Yes' : 'No',
        tr.querySelector('.f27-dim').checked ? 'Yes' : 'No',
        tr.querySelector('.f27-func').checked ? 'Yes' : 'No',
        tr.querySelector('.f27-remark').value
      ]);
    });
    const sectionsArr = [
      {
        heading: 'Sample Checks',
        table: {
          head: ['Sample','Appearance OK','Dimension OK','Functional OK','Remarks'],
          body
        }
      },
      {
        heading: 'Remarks',
        paragraph: remarksEl.value || '-'
      }
    ];
    await exportPDF({
      title: 'First Article Inspection',
      formCode: 'F27',
      metaFields,
      sections: sectionsArr,
      meta: { formCode: 'F27', part: partEl.value, lot: '' }
    });
  });

  section.querySelector('#f27-export-csv').addEventListener('click', async () => {
    const rows = [];
    section.querySelectorAll('#f27-table tbody tr').forEach((tr, idx) => {
      rows.push({
        part: partEl.value,
        revision: revEl.value,
        machine: machineEl.value,
        cavity: cavityEl.value,
        sample: idx + 1,
        appearance: tr.querySelector('.f27-appear').checked,
        dimension: tr.querySelector('.f27-dim').checked,
        functional: tr.querySelector('.f27-func').checked,
        remark: tr.querySelector('.f27-remark').value,
        disposition: dispEl.value,
        remarks: remarksEl.value
      });
    });
    const headers = ['part','revision','machine','cavity','sample','appearance','dimension','functional','remark','disposition','remarks'];
    await exportCSV(headers, rows, { formCode: 'F27', part: partEl.value, lot: '' });
  });
}