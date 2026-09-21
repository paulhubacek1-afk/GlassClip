import "./style.css";

const STORAGE_KEY = "glassclip.items.v1";
const state = { items: loadItems(), filter: "", category: "Alle" };
const app = document.querySelector("#app");

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}
function saveItems() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); }
function escapeHtml(value) {
  return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function relativeTime(timestamp) {
  const seconds = Math.floor((Date.now()-timestamp)/1000);
  if (seconds < 10) return "gerade eben";
  if (seconds < 60) return `vor ${seconds} Sek.`;
  const minutes = Math.floor(seconds/60);
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes/60);
  if (hours < 24) return `vor ${hours} Std.`;
  return new Date(timestamp).toLocaleDateString("de-AT");
}
function categoryFor(text) {
  if (/^https?:\/\//i.test(text.trim())) return "Links";
  if (text.length > 160 || text.includes("\n")) return "Text";
  return "Kurz";
}
function addItem(text) {
  const clean = text.trim();
  if (!clean) return;
  const existing = state.items.find(item => item.text === clean);
  if (existing) {
    existing.createdAt = Date.now();
    state.items = [existing, ...state.items.filter(item => item.id !== existing.id)];
  } else {
    state.items.unshift({ id: crypto.randomUUID(), text: clean, category: categoryFor(clean), createdAt: Date.now(), favorite: false });
  }
  state.items = state.items.slice(0,100);
  saveItems(); render();
}
async function readClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (!text.trim()) return showToast("Die Zwischenablage ist leer.");
    addItem(text); showToast("In GlassClip gespeichert.");
  } catch {
    showToast("Clipboard-Zugriff blockiert. Nutze das Eingabefeld unten.");
  }
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); showToast("Kopiert."); }
  catch { showToast("Kopieren wurde vom Browser blockiert."); }
}
function visibleItems() {
  return state.items.filter(item => {
    const category = state.category === "Alle" || item.category === state.category;
    const search = !state.filter || item.text.toLowerCase().includes(state.filter.toLowerCase());
    return category && search;
  });
}
function renderItem(item) {
  return `<article class="clip glass-card">
    <div class="clip-main">
      <div class="clip-meta"><span class="type">${item.category}</span><span>${relativeTime(item.createdAt)}</span></div>
      <p class="clip-text">${escapeHtml(item.text)}</p>
    </div>
    <div class="clip-actions">
      <button class="small-button ${item.favorite ? "favorite":""}" data-favorite="${item.id}" title="Favorit">${item.favorite ? "★":"☆"}</button>
      <button class="small-button" data-copy="${item.id}" title="Kopieren">↗</button>
      <button class="small-button danger" data-delete="${item.id}" title="Löschen">×</button>
    </div>
  </article>`;
}
function render() {
  const items = visibleItems();
  app.innerHTML = `<main class="shell">
    <header class="topbar">
      <div class="brand"><img src="/assets/glassclip-icon.svg" alt=""><div><div class="eyebrow">LIQUID GLASS</div><h1>GlassClip</h1></div></div>
      <button class="icon-button" id="clearAll" title="Alles löschen">⌫</button>
    </header>

    <section class="hero glass-card">
      <div><span class="pill">Clipboard</span><h2>Alles, was du kopierst.<br><span>Endlich wiederfinden.</span></h2><p>Speichere wichtige Texte und Links lokal auf diesem Gerät.</p></div>
      <button class="primary-button" id="readClipboard"><span class="button-symbol">＋</span>Clipboard einlesen</button>
    </section>

    <section class="controls">
      <label class="search"><span>⌕</span><input id="search" type="search" placeholder="In deinem Clipboard suchen …" value="${escapeHtml(state.filter)}"></label>
      <div class="filters">${["Alle","Kurz","Text","Links"].map(name => `<button class="filter ${state.category===name?"active":""}" data-category="${name}">${name}</button>`).join("")}</div>
    </section>

    <section class="paste-card glass-card">
      <div class="section-title"><div><span class="eyebrow">SCHNELL SPEICHERN</span><h3>Text hier einfügen</h3></div><span class="count">${state.items.length}/100</span></div>
      <textarea id="quickPaste" placeholder="Hier etwas einfügen oder Strg + V drücken …"></textarea>
      <button class="secondary-button" id="savePaste">Zu GlassClip hinzufügen</button>
    </section>

    <section class="history">
      <div class="section-heading"><div><span class="eyebrow">VERLAUF</span><h3>Deine letzten Clips</h3></div><span class="muted">${items.length} Treffer</span></div>
      <div class="clip-list">${items.length ? items.map(renderItem).join("") : `<div class="empty glass-card"><div class="empty-icon">✦</div><h3>Noch nichts gespeichert</h3><p>Kopiere etwas und klicke auf „Clipboard einlesen“.</p></div>`}</div>
    </section>
    <footer><span>GlassClip 0.1</span><span>Alles bleibt lokal auf diesem Gerät.</span></footer>
  </main>`;
  bindEvents();
}
function bindEvents() {
  document.querySelector("#readClipboard")?.addEventListener("click", readClipboard);
  document.querySelector("#search")?.addEventListener("input", e => {
    state.filter=e.target.value; render();
    const input=document.querySelector("#search"); input?.focus(); input?.setSelectionRange(input.value.length,input.value.length);
  });
  document.querySelectorAll("[data-category]").forEach(b=>b.addEventListener("click",()=>{state.category=b.dataset.category;render();}));
  document.querySelector("#savePaste")?.addEventListener("click",()=>{
    const t=document.querySelector("#quickPaste"); addItem(t.value); t.value="";
  });
  document.querySelector("#quickPaste")?.addEventListener("paste",()=>{
    setTimeout(()=>{const t=document.querySelector("#quickPaste"); if(t.value.trim()){addItem(t.value);t.value="";showToast("Eingefügter Text gespeichert.");}},0);
  });
  document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",()=>{
    const item=state.items.find(x=>x.id===b.dataset.copy); if(item) copyText(item.text);
  }));
  document.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{
    state.items=state.items.filter(x=>x.id!==b.dataset.delete);saveItems();render();
  }));
  document.querySelectorAll("[data-favorite]").forEach(b=>b.addEventListener("click",()=>{
    const item=state.items.find(x=>x.id===b.dataset.favorite);if(item){item.favorite=!item.favorite;saveItems();render();}
  }));
  document.querySelector("#clearAll")?.addEventListener("click",()=>{
    if(state.items.length && confirm("Wirklich den gesamten Clipboard-Verlauf löschen?")){state.items=[];saveItems();render();}
  });
}
function showToast(message) {
  let toast=document.querySelector(".toast");
  if(!toast){toast=document.createElement("div");toast.className="toast";document.body.append(toast);}
  toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);
}
window.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();document.querySelector("#search")?.focus();}
});
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"));
render();
