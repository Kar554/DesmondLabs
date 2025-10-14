// Elements
const cvForm = document.getElementById('cvForm');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const cvPreview = document.getElementById('cvPreview');
const themeSelect = document.getElementById('themeSelect');

// Load saved data
window.addEventListener('load', () => {
  const data = JSON.parse(localStorage.getItem('cvPerfectData') || '{}');
  Object.keys(data).forEach(k => {
    const el = document.getElementById(k);
    if(el) el.value = data[k];
  });
  applyTheme(data.theme || 'blue');
  generatePreview();
});

// Save on input
cvForm.addEventListener('input', () => {
  saveForm();
});

// Theme selector
themeSelect.addEventListener('change', e => {
  applyTheme(e.target.value);
  saveForm();
});

// Buttons
generateBtn.addEventListener('click', e => {
  e.preventDefault();
  generatePreview();
});

clearBtn.addEventListener('click', e => {
  if(!confirm('Réinitialiser le formulaire et la prévisualisation ?')) return;
  document.querySelectorAll('#cvForm input, #cvForm textarea').forEach(i => i.value = '');
  saveForm();
  generatePreview();
});

downloadBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const fileBase = (document.getElementById('filename').value || ('CV_' + (document.getElementById('name').value || 'utilisateur'))).replace(/\s+/g,'_');
  // If html2pdf is available, use it
  if(window.html2pdf){
    const opt = {
      margin: 0.4,
      filename: fileBase + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(cvPreview).save();
  } else {
    // fallback to print dialog
    alert('Librairie d\'export PDF non trouvée. Utiliser l\'option d\'impression du navigateur (CTRL+P) ou placez html2pdf.bundle.min.js dans /libs pour export direct.');
    window.print();
  }
});

// Save form to localStorage
function saveForm(){
  const data = {};
  document.querySelectorAll('#cvForm input, #cvForm textarea').forEach(i => {
    data[i.id] = i.value;
  });
  data.theme = themeSelect.value;
  localStorage.setItem('cvPerfectData', JSON.stringify(data));
}

// Apply theme to preview container
function applyTheme(name){
  document.documentElement.classList.remove('theme-blue','theme-green','theme-violet');
  if(name === 'green') document.documentElement.classList.add('theme-green');
  else if(name === 'violet') document.documentElement.classList.add('theme-violet');
  else document.documentElement.classList.add('theme-blue');
  themeSelect.value = name;
}

// Generate preview
function generatePreview(){
  const get = id => (document.getElementById(id).value || '').trim();

  const name = get('name') || 'Nom Complet';
  const title = get('title') || 'Titre professionnel';
  const phone = get('phone') || '';
  const email = get('email') || '';
  const portfolio = get('portfolio') || '';
  const summary = get('summary') || 'Phrase d\'accroche percutante : expertise, résultats et objectifs en 3–4 lignes.';
  const skillsTech = splitLines(get('skills_tech'));
  const skillsDesign = splitLines(get('skills_design'));
  const skillsBiz = splitLines(get('skills_business'));
  const experience = splitBlocks(get('experience'));
  const education = splitLines(get('education'));
  const projects = splitLines(get('projects'));
  const languages = get('languages');
  const certifications = get('certifications');
  const location = get('location');
  const theme = themeSelect.value;

  // Build HTML
  const html = `
    <div class="cv-root ${theme ? 'theme-' + theme : 'theme-blue'}">
      <div class="cv-header">
        <div class="left">
          <div class="cv-name">${escapeHtml(name)}</div>
          <div class="cv-title">${escapeHtml(title)}</div>
          <div class="small-muted">${escapeHtml(location)}</div>
        </div>
        <div class="contact small-muted">
          ${email ? `📧 ${escapeHtml(email)}<br/>` : ''}
          ${phone ? `📞 ${escapeHtml(phone)}<br/>` : ''}
          ${portfolio ? `<a href="${escapeAttr(portfolio)}" target="_blank" rel="noopener noreferrer">${escapeHtml(portfolio)}</a>` : ''}
        </div>
      </div>

      <div class="container-two">
        <div class="left-col">
          <div class="section">
            <h3>Phrase d'accroche</h3>
            <p class="small-muted">${escapeHtml(summary)}</p>
          </div>

          <div class="section">
            <h3>Expériences professionnelles</h3>
            ${experience.length ? experience.map(exp => formatExperience(exp)).join('') : '<p class="small-muted">Aucune expérience renseignée.</p>'}
          </div>

          <div class="section">
            <h3>Projets</h3>
            ${projects.length ? '<ul class="list">' + projects.map(p => `<li class="item">${escapeHtml(p)}</li>`).join('') + '</ul>' : '<p class="small-muted">Aucun projet listé.</p>'}
          </div>

          <div class="section">
            <h3>Formation</h3>
            ${education.length ? '<ul class="list">' + education.map(e => `<li class="item">${escapeHtml(e)}</li>`).join('') + '</ul>' : '<p class="small-muted">Aucune formation renseignée.</p>'}
          </div>
        </div>

        <aside class="right-col">
          <div class="section">
            <h3>Compétences — Techniques</h3>
            ${skillsTech.length ? skillsTech.map(s => `<span class="badge">${escapeHtml(s)}</span>`).join('') : '<p class="small-muted">—</p>'}
          </div>

          <div class="section">
            <h3>Compétences — Design</h3>
            ${skillsDesign.length ? skillsDesign.map(s => `<span class="badge">${escapeHtml(s)}</span>`).join('') : '<p class="small-muted">—</p>'}
          </div>

          <div class="section">
            <h3>Compétences — Business</h3>
            ${skillsBiz.length ? skillsBiz.map(s => `<span class="badge">${escapeHtml(s)}</span>`).join('') : '<p class="small-muted">—</p>'}
          </div>

          <div class="section">
            <h3>Langues</h3>
            <p class="small-muted">${escapeHtml(languages || '—')}</p>
          </div>

          <div class="section">
            <h3>Certifications</h3>
            <p class="small-muted">${escapeHtml(certifications || '—')}</p>
          </div>
        </aside>
      </div>
    </div>
  `;

  cvPreview.innerHTML = html;
  // ensure theme classes applied to root
  applyTheme(theme);
}

// Helpers
function splitLines(text){
  if(!text) return [];
  return text.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
}

// For experience: split paragraphs by newlines; then bullets inside split by "||"
function splitBlocks(text){
  if(!text) return [];
  const blocks = text.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  // Also allow single lines separated by newline
  if(blocks.length === 0 && text.trim()) return [text.trim()];
  return blocks;
}

function formatExperience(block){
  // If user used || to separate bullets, do it
  // First line treat as title (Poste — Entreprise — Dates)
  const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
  const title = lines[0] || '';
  // gather bullets either from same line after '—' or from '||'
  const rest = block.replace(title,'').trim();
  let bullets = [];
  if(rest.includes('||')){
    bullets = rest.split('||').map(b => b.trim()).filter(Boolean);
  } else {
    // take any subsequent lines as bullets
    bullets = lines.slice(1);
    // also try splitting title by '—' to extract meaningful
  }
  const bulletsHtml = bullets.length ? '<ul class="list">' + bullets.map(b => `<li class="item">${escapeHtml(b)}</li>`).join('') + '</ul>' : '';
  return `<div class="item"><strong>${escapeHtml(title)}</strong>${bulletsHtml}</div>`;
}

// escaping
function escapeHtml(s){
  return String(s || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
function escapeAttr(s){
  return encodeURI(String(s || ''));
}
