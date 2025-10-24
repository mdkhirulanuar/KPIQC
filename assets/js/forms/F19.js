import { putRecord } from '../db.js';
import { exportPDF, exportCSV } from '../exporter.js';
import { PrintingTimesDay, PrintingTimesNight, Parts } from '../data/catalog.js';

export function initF19(section) {
  const dateEl = section.querySelector('#f19-date');
  const shiftEl = section.querySelector('#f19-shift');
  const partEl = section.querySelector('#f19-part');
  const descEl = section.querySelector('#f19-desc');
  const dispEl = section.querySelector('#f19-disp');
  const remarksEl = section.querySelector('#f19-remarks');
  const tbody = section.querySelector('#f19-table tbody');

  function buildRows() {
    tbody.innerHTML = '';
    const times = shiftEl.value === 'Night' ? PrintingTimesNight : PrintingTimesDay;
    times.forEach(time => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${time}</td>
        <td><input type="checkbox" class="f19-appearance"></td>
        <td><input type="checkbox" class="f19-color"></td>
        <td><input type="checkbox" class="f19-reg"></td>
        <td><input type="text" class="f19-remark"></td>
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

  section.querySelector('#f19-save').addEventListener('click', async () => {
    const entries = [];
    tbody.querySelectorAll('tr').forEach(tr => {
      entries.push({
        time: tr.children[0].textContent,
        appearance: tr.querySelector('.f19-appearance').checked,
        color: tr.querySelector('.f19-color').checked,
        registration: tr.querySelector('.f19-reg').checked,
        remark: tr.querySelector('.f19-remark').value
      });
    });
    const record = {
      id: crypto.randomUUID(),
      form: 'F19',
      createdAt: new Date().toISOString(),
      date: dateEl.value,
      shift: shiftEl.value,
      part: partEl.value,
      desc: descEl.value,
      entries,
      disposition: dispEl.value,
      remarks: remarksEl.value
    };
    await putRecord('F19', record);
    alert('Printing record saved.');
  });

  section.querySelector('#f19-export-pdf').addEventListener('click', async () => {
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
        tr.querySelector('.f19-appearance').checked ? 'Yes':'No',
        tr.querySelector('.f19-color').checked ? 'Yes':'No',
        tr.querySelector('.f19-reg').checked ? 'Yes':'No',
        tr.querySelector('.f19-remark').value
      ]);
    });
    const sectionsArr = [
      {
        heading: 'Hourly Printing Checks',
        table: { head:['Time','Appearance OK','Color OK','Registration OK','Remarks'], body }
      },
      {
        heading: 'Remarks',
        paragraph: remarksEl.value || '-'
      }
    ];
    await exportPDF({
      title: 'Printing Quality Inspection',
      formCode: 'F19',
      metaFields,
      sections: sectionsArr,
      meta: { formCode: 'F19', part: partEl.value, lot: dateEl.value }
    });
  });

  section.querySelector('#f19-export-csv').addEventListener('click', async () => {
    const rows = [];
    tbody.querySelectorAll('tr').forEach(tr => {
      rows.push({
        date: dateEl.value,
        shift: shiftEl.value,
        part: partEl.value,
        desc: descEl.value,
        time: tr.children[0].textContent,
        appearance: tr.querySelector('.f19-appearance').checked,
        color: tr.querySelector('.f19-color').checked,
        registration: tr.querySelector('.f19-reg').checked,
        remark: tr.querySelector('.f19-remark').value,
        disposition: dispEl.value,
        remarks: remarksEl.value
      });
    });
    const headers = ['date','shift','part','desc','time','appearance','color','registration','remark','disposition','remarks'];
    await exportCSV(headers, rows, { formCode: 'F19', part: partEl.value, lot: dateEl.value });
  });
}