const state = {
  data: [],
  view: 'home',
  filter: 'all',
  q: '',
  lang: localStorage.getItem('lang') || 'tr',
  theme: localStorage.getItem('theme') || 'light'
};

const T = {
  tr: {
    appTitle:'Boykot Rehberi', appSubtitle:'Marka, ana firma ve alternatifleri hızlıca ara.',
    searchPlaceholder:'Marka, ana firma, kategori veya alternatif ara...',
    navHome:'Ana Sayfa', navCompanies:'Ana Firmalar', navCategories:'Kategoriler', navSafe:'Boykotta Değil', navAbout:'Hakkında', close:'Kapat',
    all:'Tümü', boycott:'Boykot', caution:'Dikkat', alternative:'Alternatif', notBoycotted:'Boykotta Değil', review:'İnceleniyor',
    brands:'Marka', parentCompany:'Ana Firma', category:'Kategori', alternatives:'Alternatifler', note:'Not', source:'Kaynak', code:'Kod', details:'Detay', openSource:'Kaynağı Aç',
    noResults:'Sonuç bulunamadı.', companies:'Ana Firmalar', categories:'Kategoriler', brandsCount:'marka', showing:'Gösterilen',
    aboutTitle:'📖 Kullanım Bilgisi', aboutIntro:'Bu uygulama markalar, ana firmalar ve alternatif seçenekler hakkında hızlı bilgi vermek için hazırlanmıştır.',
    howSearch:'🔍 Nasıl aranır?', howSearchText:'Arama kutusuna marka adı, ana firma, kategori, alternatif veya not yazarak sonuçlara ulaşabilirsin.',
    sections:'📂 Bölümler', sectionsText:'Ana Sayfa tüm listeyi, Ana Firmalar şirketlere göre gruplamayı, Kategoriler ürün gruplarını, Boykotta Değil ise alternatif.ods listesinden eklenen markaları gösterir.',
    disclaimer:'⚠️ Bilgilendirme', disclaimerText:'Bilgiler farklı kaynaklardan derlenmiştir. Satın alma kararı vermeden önce güncel bilgileri bağımsız kaynaklardan da kontrol etmen tavsiye edilir.',
    updates:'🔄 Güncellemeler', updatesText:'Yeni markalar data.json dosyası güncellenerek eklenebilir. Uygulamayı GitHub Pages üzerinde kullanabilirsin.'
  },
  en: {
    appTitle:'Boycott Guide', appSubtitle:'Quickly search brands, parent companies and alternatives.',
    searchPlaceholder:'Search brand, parent company, category or alternative...',
    navHome:'Home', navCompanies:'Parent Companies', navCategories:'Categories', navSafe:'Not Boycotted', navAbout:'About', close:'Close',
    all:'All', boycott:'Boycott', caution:'Caution', alternative:'Alternative', notBoycotted:'Not Boycotted', review:'Under Review',
    brands:'Brands', parentCompany:'Parent Company', category:'Category', alternatives:'Alternatives', note:'Note', source:'Source', code:'Code', details:'Details', openSource:'Open Source',
    noResults:'No results found.', companies:'Parent Companies', categories:'Categories', brandsCount:'brands', showing:'Showing',
    aboutTitle:'📖 About & How to Use', aboutIntro:'This app helps you quickly check brands, parent companies and alternative options.',
    howSearch:'🔍 How to search', howSearchText:'Type a brand, parent company, category, alternative or note into the search box to filter the list.',
    sections:'📂 Sections', sectionsText:'Home shows the full list, Parent Companies groups by company, Categories groups by product type, and Not Boycotted shows brands added from the alternatives file.',
    disclaimer:'⚠️ Disclaimer', disclaimerText:'Information is compiled from different sources. Before making purchasing decisions, you should also verify current information independently.',
    updates:'🔄 Updates', updatesText:'New brands can be added by updating data.json. The app can be published on GitHub Pages.'
  },
  de: {
    appTitle:'Boykott-Ratgeber', appSubtitle:'Marken, Mutterfirmen und Alternativen schnell suchen.',
    searchPlaceholder:'Marke, Mutterfirma, Kategorie oder Alternative suchen...',
    navHome:'Start', navCompanies:'Mutterfirmen', navCategories:'Kategorien', navSafe:'Nicht boykottiert', navAbout:'Info', close:'Schließen',
    all:'Alle', boycott:'Boykott', caution:'Achtung', alternative:'Alternative', notBoycotted:'Nicht boykottiert', review:'In Prüfung',
    brands:'Marken', parentCompany:'Mutterfirma', category:'Kategorie', alternatives:'Alternativen', note:'Notiz', source:'Quelle', code:'Code', details:'Details', openSource:'Quelle öffnen',
    noResults:'Keine Ergebnisse gefunden.', companies:'Mutterfirmen', categories:'Kategorien', brandsCount:'Marken', showing:'Angezeigt',
    aboutTitle:'📖 Info & Nutzung', aboutIntro:'Diese App hilft dir, Marken, Mutterfirmen und Alternativen schnell zu prüfen.',
    howSearch:'🔍 Suche', howSearchText:'Gib Marke, Mutterfirma, Kategorie, Alternative oder Notiz in das Suchfeld ein, um die Liste zu filtern.',
    sections:'📂 Bereiche', sectionsText:'Start zeigt die komplette Liste, Mutterfirmen gruppiert nach Unternehmen, Kategorien nach Produktgruppen und Nicht boykottiert zeigt Marken aus der Alternativen-Datei.',
    disclaimer:'⚠️ Hinweis', disclaimerText:'Die Informationen wurden aus verschiedenen Quellen zusammengestellt. Vor Kaufentscheidungen solltest du aktuelle Informationen zusätzlich unabhängig prüfen.',
    updates:'🔄 Updates', updatesText:'Neue Marken können durch Aktualisierung der data.json ergänzt werden. Die App kann über GitHub Pages veröffentlicht werden.'
  }
};

const statusMap = {
  boykot:{key:'boycott', icon:'🔴', cls:'boykot'},
  dikkat:{key:'caution', icon:'🟠', cls:'dikkat'},
  alternatif:{key:'alternative', icon:'🟢', cls:'alternatif'},
  boykottaDegil:{key:'notBoycotted', icon:'✅', cls:'boykottaDegil'},
  inceleniyor:{key:'review', icon:'⚪', cls:'inceleniyor'}
};

const el = id => document.getElementById(id);
const search = el('search'), results = el('results'), stats = el('stats'), chips = el('chips');
function tr(){ return T[state.lang] || T.tr; }
function esc(s){ return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function norm(s){ return String(s ?? '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }
function get(item,k){
  const aliases = { anaFirma:['anaFirma','anafirma','ana_firma','Ana Firma'], marka:['marka','Marka','brand'], durum:['durum','status'], kategori:['kategori','category'], alternatif:['alternatif','alternative'], kaynak:['kaynak','source'], not:['not','note'], kod:['kod','code'] };
  for(const a of aliases[k] || [k]) if(item[a] !== undefined && item[a] !== null && String(item[a]).trim() !== '') return item[a];
  return '';
}
function statusOf(item){
  const d = String(get(item,'durum') || '').trim();
  if(statusMap[d]) return d;
  const k = String(get(item,'kod')).toUpperCase();
  if(k.startsWith('D')) return 'inceleniyor';
  if(k.startsWith('C')) return 'alternatif';
  if(k.startsWith('B')) return 'dikkat';
  if(k === 'BD') return 'boykottaDegil';
  return 'boykot';
}
function labelStatus(s){ const m=statusMap[s] || statusMap.inceleniyor; return `${m.icon} ${tr()[m.key]}`; }
function sourceHref(src){ const s=String(src||'').trim(); return /^https?:\/\//i.test(s) ? s : ''; }
function itemHay(item){ return norm([get(item,'marka'),get(item,'anaFirma'),get(item,'kategori'),get(item,'alternatif'),get(item,'not'),get(item,'kaynak'),get(item,'kod'),labelStatus(statusOf(item))].join(' ')); }
function filteredData(){
  const q = norm(state.q);
  return state.data.filter(item => {
    const st = statusOf(item);
    const okFilter = state.filter === 'all' || st === state.filter;
    const okQ = !q || itemHay(item).includes(q);
    if(state.view === 'safe' && st !== 'boykottaDegil') return false;
    return okFilter && okQ;
  }).sort((a,b)=>String(get(a,'marka')).localeCompare(String(get(b,'marka')),'tr'));
}
function applyLang(){
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = tr()[n.dataset.i18n] || n.textContent; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(n => { n.placeholder = tr()[n.dataset.i18nPlaceholder] || n.placeholder; });
  document.querySelectorAll('.lang').forEach(b => b.classList.toggle('active', b.dataset.lang === state.lang));
}
function renderStats(){
  const counts = { all:state.data.length, boykot:0, dikkat:0, alternatif:0, boykottaDegil:0, inceleniyor:0 };
  for(const it of state.data){ counts[statusOf(it)] = (counts[statusOf(it)]||0)+1; }
  const cards = [
    ['boykot','boycott','var(--danger)'], ['dikkat','caution','var(--warn)'], ['alternatif','alternative','var(--ok)'], ['boykottaDegil','notBoycotted','var(--safe)'], ['inceleniyor','review','var(--review)']
  ];
  stats.innerHTML = cards.map(([k,label,color])=>`<button class="stat" data-filter="${k}"><b>${counts[k]||0}</b><small><span class="dot" style="background:${color}"></span>${tr()[label]}</small></button>`).join('');
}
function renderChips(){
  const arr = [['all','all'],['boykot','boycott'],['dikkat','caution'],['alternatif','alternative'],['boykottaDegil','notBoycotted'],['inceleniyor','review']];
  chips.innerHTML = arr.map(([v,k])=>`<button class="chip ${state.filter===v?'active':''}" data-filter="${v}">${tr()[k]}</button>`).join('');
}
function card(item){
  const s = statusOf(item), m = statusMap[s] || statusMap.inceleniyor;
  const src = sourceHref(get(item,'kaynak'));
  return `<article class="card ${m.cls}" data-brand="${encodeURIComponent(get(item,'marka'))}">
    <div class="cardTop"><div><span class="status">${labelStatus(s)}</span><h2>${esc(get(item,'marka') || '-')}</h2></div><span class="code">${esc(get(item,'kod') || '-')}</span></div>
    <div class="meta">
      <div class="metaRow"><span>🏢 ${tr().parentCompany}</span><b>${esc(get(item,'anaFirma') || '-')}</b></div>
      <div class="metaRow"><span>📂 ${tr().category}</span><b>${esc(get(item,'kategori') || '-')}</b></div>
      <div class="metaRow"><span>✅ ${tr().alternatives}</span><b class="altText">${esc(get(item,'alternatif') || '-')}</b></div>
      ${src ? `<div class="metaRow"><span>🌐 ${tr().source}</span><b>${esc(new URL(src).hostname.replace('www.',''))}</b></div>` : ''}
    </div>
  </article>`;
}
function renderHome(){
  renderStats(); renderChips();
  const list = filteredData();
  results.innerHTML = list.length ? list.slice(0,400).map(card).join('') + (list.length>400 ? `<div class="empty">${tr().showing} 400 / ${list.length}</div>` : '') : `<div class="empty">${tr().noResults}</div>`;
}
function groupBy(field){
  const map = new Map();
  for(const item of state.data){
    if(state.q && !itemHay(item).includes(norm(state.q))) continue;
    const key = String(get(item,field) || '-').trim() || '-';
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0],'tr'));
}
function renderGroups(kind){
  stats.innerHTML=''; chips.innerHTML='';
  const field = kind === 'companies' ? 'anaFirma' : 'kategori';
  const title = kind === 'companies' ? tr().companies : tr().categories;
  const groups = groupBy(field);
  results.innerHTML = `<div class="aboutCard"><h2>${kind==='companies'?'🏢':'📂'} ${title}</h2><p>${groups.length} ${title.toLocaleLowerCase(state.lang)}</p></div>` + groups.map(([name,items])=>`<button class="group" data-group-field="${field}" data-group-value="${esc(name)}"><span><b>${esc(name)}</b><br><small>${items.length} ${tr().brandsCount}</small></span><strong>›</strong></button>`).join('');
}
function renderAbout(){
  stats.innerHTML=''; chips.innerHTML='';
  const total=state.data.length, safe=state.data.filter(x=>statusOf(x)==='boykottaDegil').length;
  results.innerHTML = `<section class="aboutGrid">
    <div class="aboutCard"><h2>${tr().aboutTitle}</h2><p>${tr().aboutIntro}</p><p><b>${total}</b> ${tr().brandsCount} • <b>${safe}</b> ${tr().notBoycotted}</p></div>
    <div class="aboutCard"><h3>${tr().howSearch}</h3><p>${tr().howSearchText}</p></div>
    <div class="aboutCard"><h3>${tr().sections}</h3><p>${tr().sectionsText}</p></div>
    <div class="aboutCard"><h3>${tr().updates}</h3><p>${tr().updatesText}</p></div>
    <div class="aboutCard"><h3>${tr().disclaimer}</h3><p>${tr().disclaimerText}</p></div>
    <div class="aboutCard"><h3>Boykot Rehberi v3.0</h3><ul><li>TR / EN / DE</li><li>PWA</li><li>GitHub Pages</li></ul></div>
  </section>`;
}
function render(){
  applyLang();
  document.body.dataset.theme = state.theme;
  document.querySelectorAll('.bottomNav button').forEach(b=>b.classList.toggle('active', b.dataset.view === state.view));
  if(state.view === 'home') return renderHome();
  if(state.view === 'safe') { state.filter='boykottaDegil'; return renderHome(); }
  if(state.view === 'companies') return renderGroups('companies');
  if(state.view === 'categories') return renderGroups('categories');
  if(state.view === 'about') return renderAbout();
}
async function init(){
  try{
    const res = await fetch('data.json?v=3.0.1', {cache:'no-store'});
    if(!res.ok) throw new Error('data.json');
    state.data = await res.json();
    render();
  }catch(e){
    results.innerHTML = `<div class="empty">data.json yüklenemedi. Dosyalar aynı klasörde olmalı.</div>`;
  }
}
search.addEventListener('input', e => { state.q = e.target.value; if(state.view==='about') state.view='home'; render(); });
el('clearBtn').addEventListener('click', ()=>{ search.value=''; state.q=''; render(); search.focus(); });
document.querySelectorAll('.bottomNav button').forEach(btn=>btn.addEventListener('click',()=>{ state.view=btn.dataset.view; state.filter='all'; render(); window.scrollTo({top:0,behavior:'smooth'}); }));
document.querySelectorAll('.lang').forEach(btn=>btn.addEventListener('click',()=>{ state.lang=btn.dataset.lang; localStorage.setItem('lang',state.lang); render(); }));
el('themeBtn').addEventListener('click',()=>{ state.theme=state.theme==='dark'?'light':'dark'; localStorage.setItem('theme',state.theme); el('themeBtn').textContent=state.theme==='dark'?'☀️':'🌙'; render(); });
document.addEventListener('click', e=>{
  const f = e.target.closest('[data-filter]');
  if(f){ state.filter=f.dataset.filter; state.view='home'; render(); return; }
  const g = e.target.closest('[data-group-field]');
  if(g){ state.view='home'; state.filter='all'; search.value=g.dataset.groupValue; state.q=g.dataset.groupValue; render(); return; }
  const c = e.target.closest('[data-brand]');
  if(c){ const name=decodeURIComponent(c.dataset.brand); const item=state.data.find(x=>String(get(x,'marka'))===name); if(item) showDetail(item); }
});
function showDetail(item){
  const s=statusOf(item), src=sourceHref(get(item,'kaynak'));
  el('detailContent').innerHTML = `<span class="status">${labelStatus(s)}</span><h2 class="detailTitle">${esc(get(item,'marka'))}</h2>
    <div class="meta">
      <div class="metaRow"><span>🏢 ${tr().parentCompany}</span><b>${esc(get(item,'anaFirma')||'-')}</b></div>
      <div class="metaRow"><span>📂 ${tr().category}</span><b>${esc(get(item,'kategori')||'-')}</b></div>
      <div class="metaRow"><span>🏷️ ${tr().code}</span><b>${esc(get(item,'kod')||'-')}</b></div>
      <div class="metaRow"><span>✅ ${tr().alternatives}</span><b class="altText">${esc(get(item,'alternatif')||'-')}</b></div>
      <div class="metaRow"><span>📝 ${tr().note}</span><b>${esc(get(item,'not')||'-')}</b></div>
    </div>${src ? `<a class="sourceLink" href="${esc(src)}" target="_blank" rel="noopener">🌐 ${tr().openSource}</a>` : ''}`;
  el('detailDialog').showModal();
}
el('closeDialog').addEventListener('click',()=>el('detailDialog').close());
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
init();
