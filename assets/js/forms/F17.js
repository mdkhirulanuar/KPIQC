import { putRecord } from '../db.js';
import { exportPDF, exportCSV } from '../exporter.js';
import { InProcessTimesDay, InProcessTimesNight, Parts } from '../data/catalog.js';

export function initF17(section) {
  const dateEl = section.querySelector('#f17-date');
  const shiftEl = section.querySelector('#f17-shift');
  const partEl = section.querySelector('#f17-part');
  const descEl = section.querySelector('#f17-desc');
  const dispEl = section.querySelector('#f17-disp');
  const remarksEl = section.querySelector('#f17-remarks');
  const tbody = section.querySelector('#f17-table tbody');

  function buildRows() {
    tbody.innerHTML = '';
    const times = shiftEl.value === 'Night' ? InProcessTimesNight : InProcessTimesDay;
    times.forEach(time => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${time}</td>
        <td><input type="number" class="f17-defect" value="0" min="0"></td>
        <td><input type="checkbox" class="f17-dim"></td>
        <td><input type="text" class="f17-remark"></td>
      `;
      tbody.appendChild(tr);
    });
  }

  shiftEl.addEventListener('change', buildRows);
  buildRows();

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

  section.querySelector('#f17-save').addEventListener('click', async () => {
    const entries = [];
    tbody.querySelectorAll('tr').forEach(tr => {
      entries.push({
        time: tr.children[0].textContent,
        defects: parseInt(tr.querySelector('.f17-defect').value || '0', 10),
        dimension: tr.querySelector('.f17-dim').checked,
        remark: tr.querySelector('.f17-remark').value
      });
    });
    const record = {
      id: crypto.randomUUID(),
      form: 'F17',
      createdAt: new Date().toISOString(),
      date: dateEl.value,
      shift: shiftEl.value,
      part: partEl.value,
      desc: descEl.value,
      entries,
      disposition: dispEl.value,
      remarks: remarksEl.value
    };
    await putRecord('F17', record);
    alert('In-Process record saved.');
  });

  section.querySelector('#f17-export-pdf').addEventListener('click', async () => {
    const metaFields = {
      'Date': dateEl.value,
      'Shift': shiftEl.value,
      'Part': partEl.value,
      'Description': descEl.value,
      'Disposition': dispEl.value
    };
    const body = [];
    tbody.querySelectorAll('tr').forEach(tr => {
      body.push([
        tr.children[0].textContent,
        tr.querySelector('.f17-defect').value,
        tr.querySelector('.f17-dim').checked ? 'Yes' : 'No',
        tr.querySelector('.f17-remark').value
      ]);
    });
    const sectionsArr = [
      {
        heading: 'Hourly Checks',
        table: { head:['Time','Defects','Dimension OK','Remarks'], body }
      },
      {
        heading: 'Remarks',
        paragraph: remarksEl.value || '-'
      }
    ];
    await exportPDF({
      title: 'In-Process Inspection Log',
      formCode: 'F17',
      metaFields,
      sections: sectionsArr,
      meta: { formCode: 'F17', part: partEl.value, lot: dateEl.value }
    });
  });

  section.querySelector('#f17-export-csv').addEventListener('click', async () => {
    const rows = [];
    tbody.querySelectorAll('tr').forEach(tr => {
      rows.push({
        date: dateEl.value,
        shift: shiftEl.value,
        part: partEl.value,
        desc: descEl.value,
        time: tr.children[0].textContent,
        defects: tr.querySelector('.f17-defect').value,
        dimension: tr.querySelector('.f17-dim').checked,
        remark: tr.querySelector('.f17-remark').value,
        disposition: dispEl.value,
        remarks: remarksEl.value
      });
    });
    const headers = ['date','shift','part','desc','time','defects','dimension','remark','disposition','remarks'];
    await exportCSV(headers, rows, { formCode: 'F17', part: partEl.value, lot: dateEl.value });
  });
}