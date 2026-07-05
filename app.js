'use strict';

let DATA = [];
let view = 'home';
let filter = 'all';
let lang = localStorage.getItem('boykot_lang') || 'tr';
let theme = localStorage.getItem('boykot_theme') || 'light';
let selectedTitle = '';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const T = {
  tr: {
    appTitle: 'Boykot Rehberi', tagline: 'Marka, ana firma ve alternatif arama', searchPlaceholder: 'Marka, ana firma, kategori veya alternatif ara...',
    home: 'Ana Sayfa', companies: 'Ana Firmalar', categories: 'Kategoriler', alternatives: 'Alternatifler', notBoycotted: 'Boykotta Değil', about: 'Hakkında', close: 'Kapat',
    all: 'Tümü', boycott: 'Boykot', caution: 'Dikkat', alternative: 'Alternatif', notBoycottedStatus: 'Boykotta Değil', review: 'İnceleniyor',
    brand: 'Marka', parent: 'Ana Firma', category: 'Kategori', code: 'Kod', alt: 'Alternatif', note: 'Not', source: 'Kaynak', details: 'Ayrıntıları Gör', openSource: 'Kaynağı Aç',
    noResults: 'Sonuç bulunamadı.', brands: 'marka', countWithAlternatives: 'Alternatifli', total: 'Toplam',
    aboutTitle: '📖 Kullanım Bilgisi', aboutIntro: 'Bu uygulama, markalar hakkında hızlı bilgi edinmenize ve alternatif ürünleri kolayca bulmanıza yardımcı olmak için hazırlanmıştır.',
    howSearch: '🔍 Nasıl aranır?', howSearchText: 'Arama kutusuna marka, ana firma, kategori, alternatif veya not yazarak sonuçları filtreleyebilirsiniz.',
    parentText: '🏢 Ana firmalar', parentDesc: 'Aynı şirkete ait markaları tek ekranda görebilirsiniz.',
    categoryText: '📂 Kategoriler', categoryDesc: 'Ürün gruplarına göre listeleme yapabilirsiniz.',
    disclaimer: '⚠️ Bilgilendirme', disclaimerText: 'Bu uygulama bilgilendirme amacıyla hazırlanmıştır. Satın alma kararı vermeden önce güncel bilgileri bağımsız kaynaklardan da doğrulamanız tavsiye edilir.',
    version: 'Sürüm 3.0 — TR / EN / DE'
  },
  en: {
    appTitle: 'Boycott Guide', tagline: 'Search brands, parent companies and alternatives', searchPlaceholder: 'Search brand, parent company, category or alternative...',
    home: 'Home', companies: 'Parent Companies', categories: 'Categories', alternatives: 'Alternatives', notBoycotted: 'Not Boycotted', about: 'About', close: 'Close',
    all: 'All', boycott: 'Boycott', caution: 'Caution', alternative: 'Alternative', notBoycottedStatus: 'Not Boycotted', review: 'Under Review',
    brand: 'Brand', parent: 'Parent Company', category: 'Category', code: 'Code', alt: 'Alternatives', note: 'Note', source: 'Source', details: 'View Details', openSource: 'Open Source',
    noResults: 'No results found.', brands: 'brands', countWithAlternatives: 'With alternatives', total: 'Total',
    aboutTitle: '📖 How to Use', aboutIntro: 'This app helps you quickly look up brands, parent companies and possible alternatives.',
    howSearch: '🔍 Search', howSearchText: 'Type a brand, parent company, category, alternative or note to filter the list.',
    parentText: '🏢 Parent companies', parentDesc: 'See all brands that belong to the same company in one place.',
    categoryText: '📂 Categories', categoryDesc: 'Browse brands by product category.',
    disclaimer: '⚠️ Disclaimer', disclaimerText: 'This app is for informational purposes. Please verify important information from independent, up-to-date sources before making purchasing decisions.',
    version: 'Version 3.0 — TR / EN / DE'
  },
  de: {
    appTitle: 'Boykott-Ratgeber', tagline: 'Marken, Mutterfirmen und Alternativen suchen', searchPlaceholder: 'Marke, Mutterfirma, Kategorie oder Alternative suchen...',
    home: 'Start', companies: 'Mutterfirmen', categories: 'Kategorien', alternatives: 'Alternativen', notBoycotted: 'Nicht boykottiert', about: 'Info', close: 'Schließen',
    all: 'Alle', boycott: 'Boykott', caution: 'Achtung', alternative: 'Alternative', notBoycottedStatus: 'Nicht boykottiert', review: 'In Prüfung',
    brand: 'Marke', parent: 'Mutterfirma', category: 'Kategorie', code: 'Code', alt: 'Alternativen', note: 'Notiz', source: 'Quelle', details: 'Details ansehen', openSource: 'Quelle öffnen',
    noResults: 'Keine Ergebnisse gefunden.', brands: 'Marken', countWithAlternatives: 'Mit Alternativen', total: 'Gesamt',
    aboutTitle: '📖 Nutzungshinweise', aboutIntro: 'Diese App hilft dabei, Marken, Mutterfirmen und mögliche Alternativen schnell zu finden.',
    howSearch: '🔍 Suche', howSearchText: 'Geben Sie Marke, Mutterfirma, Kategorie, Alternative oder Notiz ein, um die Liste zu filtern.',
    parentText: '🏢 Mutterfirmen', parentDesc: 'Sehen Sie alle Marken derselben Firma an einem Ort.',
    categoryText: '📂 Kategorien', categoryDesc: 'Durchsuchen Sie Marken nach Produktkategorien.',
    disclaimer: '⚠️ Hinweis', disclaimerText: 'Diese App dient nur zur Information. Bitte prüfen Sie wichtige Informationen zusätzlich über aktuelle, unabhängige Quellen.',
    version: 'Version 3.0 — TR / EN / DE'
  }
};

const statusMap = {
  boykot: { icon:'🔴', key:'boycott', cls:'boykot' },
  dikkat: { icon:'🟠', key:'caution', cls:'dikkat' },
  alternatif: { icon:'🟢', key:'alternative', cls:'alternatif' },
  boykottaDegil: { icon:'✅', key:'notBoycottedStatus', cls:'boykottaDegil' },
  inceleniyor: { icon:'⚪', key:'review', cls:'inceleniyor' }
};

function tr(){ return T[lang] || T.tr; }
function esc(s){ return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function norm(s){ return String(s ?? '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i'); }
function getStatus(item){
  const raw = item.durum || 'boykot';
  if (statusMap[raw]) return raw;
  const n = norm(raw).replace(/\s+/g,'');
  if (n.includes('degil') || n.includes('notboy')) return 'boykottaDegil';
  if (n.includes('alternatif')) return 'alternatif';
  if (n.includes('dikkat') || n.includes('caution')) return 'dikkat';
  if (n.includes('ince') || n.includes('review')) return 'inceleniyor';
  return 'boykot';
}
function parentOf(item){ return item.anaFirma || item.anafirma || ''; }
function altArray(item){ return String(item.alternatif || '').split(/[;,•]+/).map(x=>x.trim()).filter(Boolean).slice(0,6); }
function haystack(item){ return norm([item.marka,parentOf(item),item.kategori,item.alternatif,item.kaynak,item.not,item.kod,getStatus(item)].join(' ')); }

async function init(){
  document.documentElement.dataset.theme = theme;
  applyLang();
  try{
    const res = await fetch('data.json?v=3-clean-20260705', { cache:'no-store' });
    if(!res.ok) throw new Error('data.json yüklenemedi');
    const json = await res.json();
    DATA = Array.isArray(json) ? json.filter(x=>x && x.marka) : [];
    render();
  }catch(err){
    $('#results').innerHTML = `<div class="empty"><b>Hata</b><br>${esc(err.message)}</div>`;
  }
}

function applyLang(){
  $$('[data-i18n]').forEach(el => el.textContent = tr()[el.dataset.i18n] || el.textContent);
  $$('[data-i18n-placeholder]').forEach(el => el.placeholder = tr()[el.dataset.i18nPlaceholder] || el.placeholder);
  $$('.lang').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
  $('#themeBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
}

function renderStats(){
  const counts = { boykot:0, dikkat:0, alternatif:0, boykottaDegil:0, inceleniyor:0 };
  DATA.forEach(item => counts[getStatus(item)]++);
  const withAlt = DATA.filter(x => String(x.alternatif || '').trim()).length;
  const blocks = [
    ['📦', tr().total, DATA.length], ['🔴', tr().boycott, counts.boykot], ['🟢', tr().alternative, counts.alternatif], ['✅', tr().notBoycotted, counts.boykottaDegil], ['⭐', tr().countWithAlternatives, withAlt]
  ];
  $('#stats').innerHTML = blocks.map(([i,l,n]) => `<div class="stat"><b>${i} ${n}</b><small>${esc(l)}</small></div>`).join('');
}

function renderChips(){
  const chips = [['all',tr().all],['boykot','🔴 '+tr().boycott],['dikkat','🟠 '+tr().caution],['alternatif','🟢 '+tr().alternative],['boykottaDegil','✅ '+tr().notBoycotted],['inceleniyor','⚪ '+tr().review]];
  $('#chips').innerHTML = chips.map(([key,label]) => `<button class="chip ${filter===key?'active':''}" data-filter="${key}" type="button">${esc(label)}</button>`).join('');
}

function listForHome(){
  const q = norm($('#search').value.trim());
  let list = DATA.filter(item => (!q || haystack(item).includes(q)) && (filter === 'all' || getStatus(item) === filter));
  if (view === 'notBoycotted') list = list.filter(item => getStatus(item) === 'boykottaDegil');
  return list.sort((a,b) => String(a.marka).localeCompare(String(b.marka),'tr'));
}

function renderCards(list){
  if(!list.length) return `<div class="empty">${esc(tr().noResults)}</div>`;
  return list.slice(0,400).map(card).join('');
}
function card(item){
  const st = statusMap[getStatus(item)];
  const alts = altArray(item);
  return `<article class="card ${st.cls}" data-brand="${encodeURIComponent(item.marka)}">
    <div class="card-top"><div><div class="status">${st.icon} ${esc(tr()[st.key])}</div><h2>${esc(item.marka)}</h2></div><div class="code">${esc(item.kod || '-')}</div></div>
    <div class="meta">
      <div class="row"><span>${esc(tr().parent)}</span><b>${esc(parentOf(item) || '-')}</b></div>
      <div class="row"><span>${esc(tr().category)}</span><b>${esc(item.kategori || '-')}</b></div>
      <div class="row"><span>${esc(tr().alt)}</span><b class="alt-list">${alts.length ? alts.map(a=>`<em class="tag">${esc(a)}</em>`).join('') : '-'}</b></div>
    </div>
    <button class="open" type="button">${esc(tr().details)} →</button>
  </article>`;
}

function renderHome(){
  renderStats(); renderChips();
  $('#results').innerHTML = renderCards(listForHome());
}
function groupBy(field){
  const map = new Map();
  DATA.forEach(item => {
    const key = field === 'company' ? (parentOf(item) || '-') : (item.kategori || '-');
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0],'tr'));
}
function renderGroups(field){
  renderStats(); $('#chips').innerHTML = '';
  const icon = field === 'company' ? '🏢' : '📂';
  const title = field === 'company' ? tr().companies : tr().categories;
  $('#results').innerHTML = `<div class="empty"><b>${esc(title)}</b></div>` + groupBy(field).map(([name,items]) =>
    `<div class="group" data-group-field="${field}" data-group="${encodeURIComponent(name)}"><div class="group-icon">${icon}</div><div><b>${esc(name)}</b><small>${items.length} ${esc(tr().brands)}</small></div><span>›</span></div>`
  ).join('');
}
function renderGroupList(field, value){
  renderStats(); $('#chips').innerHTML = `<button class="chip active" data-back="${field}" type="button">← ${esc(field==='company'?tr().companies:tr().categories)}</button>`;
  const list = DATA.filter(item => (field === 'company' ? parentOf(item) : item.kategori || '-') === value);
  $('#results').innerHTML = `<div class="empty"><b>${esc(value)}</b><br>${list.length} ${esc(tr().brands)}</div>` + renderCards(list);
}
function renderAbout(){
  $('#stats').innerHTML = ''; $('#chips').innerHTML = '';
  $('#results').innerHTML = `<section class="about-grid">
    <div class="about-card"><h3>${esc(tr().aboutTitle)}</h3><p>${esc(tr().aboutIntro)}</p></div>
    <div class="about-card"><h3>${esc(tr().howSearch)}</h3><p>${esc(tr().howSearchText)}</p></div>
    <div class="about-card"><h3>${esc(tr().parentText)}</h3><p>${esc(tr().parentDesc)}</p></div>
    <div class="about-card"><h3>${esc(tr().categoryText)}</h3><p>${esc(tr().categoryDesc)}</p></div>
    <div class="about-card"><h3>${esc(tr().disclaimer)}</h3><p>${esc(tr().disclaimerText)}</p></div>
    <div class="about-card"><h3>Boykot Rehberi</h3><p>${esc(tr().version)}</p><p>${DATA.length} ${esc(tr().brands)}</p></div>
  </section>`;
}
function render(){
  applyLang();
  $$('.bottom-nav button').forEach(b=>b.classList.toggle('nav-active', b.dataset.view===view));
  if(view === 'home' || view === 'notBoycotted') renderHome();
  else if(view === 'companies') renderGroups('company');
  else if(view === 'categories') renderGroups('category');
  else if(view === 'groupCompany') renderGroupList('company', selectedTitle);
  else if(view === 'groupCategory') renderGroupList('category', selectedTitle);
  else if(view === 'about') renderAbout();
}
function showDetail(item){
  const st = statusMap[getStatus(item)];
  const source = item.kaynak && /^https?:\/\//i.test(item.kaynak) ? `<a class="source-link" href="${esc(item.kaynak)}" target="_blank" rel="noopener">${esc(tr().openSource)}</a>` : `<div class="detail-row"><span>${esc(tr().source)}</span><b>${esc(item.kaynak || '-')}</b></div>`;
  $('#detailContent').innerHTML = `<div class="detail-head"><div class="status">${st.icon} ${esc(tr()[st.key])}</div><h2>${esc(item.marka)}</h2></div>
    <div class="detail-row"><span>${esc(tr().parent)}</span><b>${esc(parentOf(item) || '-')}</b></div>
    <div class="detail-row"><span>${esc(tr().category)}</span><b>${esc(item.kategori || '-')}</b></div>
    <div class="detail-row"><span>${esc(tr().code)}</span><b>${esc(item.kod || '-')}</b></div>
    <div class="detail-row"><span>${esc(tr().alt)}</span><b>${esc(item.alternatif || '-')}</b></div>
    <div class="detail-row"><span>${esc(tr().note)}</span><b>${esc(item.not || '-')}</b></div>${source}`;
  $('#detailDialog').showModal();
}

$('#search').addEventListener('input', () => { if(view !== 'home' && view !== 'notBoycotted') view='home'; render(); });
$('#clearBtn').addEventListener('click', () => { $('#search').value=''; render(); });
$('#themeBtn').addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('boykot_theme', theme); document.documentElement.dataset.theme = theme; applyLang(); });
$$('.lang').forEach(btn => btn.addEventListener('click', () => { lang = btn.dataset.lang; localStorage.setItem('boykot_lang', lang); render(); }));
$$('.bottom-nav button').forEach(btn => btn.addEventListener('click', () => { view = btn.dataset.view; if(view==='notBoycotted') filter='boykottaDegil'; else if(view==='home') filter='all'; render(); }));
$('#chips').addEventListener('click', e => { const chip=e.target.closest('[data-filter]'); if(chip){ filter=chip.dataset.filter; render(); } const back=e.target.closest('[data-back]'); if(back){ view = back.dataset.back === 'company' ? 'companies' : 'categories'; render(); }});
$('#results').addEventListener('click', e => {
  const group = e.target.closest('[data-group]');
  if(group){ selectedTitle = decodeURIComponent(group.dataset.group); view = group.dataset.groupField === 'company' ? 'groupCompany' : 'groupCategory'; render(); return; }
  const cardEl = e.target.closest('[data-brand]');
  if(cardEl){ const name=decodeURIComponent(cardEl.dataset.brand); const item=DATA.find(x=>x.marka===name); if(item) showDetail(item); }
});
$('#closeDialog').addEventListener('click', () => $('#detailDialog').close());

if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
init();
