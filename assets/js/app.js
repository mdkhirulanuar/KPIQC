import { initF25 } from './forms/F25.js';
import { initF26 } from './forms/F26.js';
import { initF27 } from './forms/F27.js';
import { initF17 } from './forms/F17.js';
import { initF19 } from './forms/F19.js';
import { initF18 } from './forms/F18.js';
import { initF23 } from './forms/F23.js';

// Module selection and language toggle
const modules = [
  { id: 'F26', name: 'Incoming (F26)' },
  { id: 'F25', name: 'AQL Record (F25)' },
  { id: 'F27', name: 'First Article (F27)' },
  { id: 'F17', name: 'In-Process (F17)' },
  { id: 'F19', name: 'Printing (F19)' },
  { id: 'F18', name: 'Outgoing (F18)' },
  { id: 'F23', name: 'Defect Log (F23)' },
];

const moduleSelect = document.getElementById('module-select');
modules.forEach(m => {
  const opt = document.createElement('option');
  opt.value = m.id;
  opt.textContent = m.name;
  moduleSelect.appendChild(opt);
});

moduleSelect.addEventListener('change', () => {
  const val = moduleSelect.value;
  modules.forEach(m => {
    const sec = document.getElementById(m.id);
    sec.classList.add('hidden');
  });
  const current = document.getElementById(val);
  if (current) current.classList.remove('hidden');
});

// Initialize modules after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  initF26(document.getElementById('F26'));
  initF25(document.getElementById('F25'));
  initF27(document.getElementById('F27'));
  initF17(document.getElementById('F17'));
  initF19(document.getElementById('F19'));
  initF18(document.getElementById('F18'));
  initF23(document.getElementById('F23'));
  // show first module by default
  moduleSelect.value = modules[0].id;
  moduleSelect.dispatchEvent(new Event('change'));
});