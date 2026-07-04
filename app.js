let DATA = [];
let currentFilter = "all";

const labels = {
  boykot: "🔴 BOYKOT",
  dikkat: "🟠 DİKKAT",
  alternatif: "🟢 ALTERNATİF",
  inceleniyor: "⚪ İNCELENİYOR"
};

async function loadData(){
  const res = await fetch("data.json");
  DATA = await res.json();
  render();
}

function normalize(s){
  return (s || "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function render(){
  const q = normalize(document.getElementById("search").value.trim());
  const results = document.getElementById("results");
  results.innerHTML = "";

  let list = DATA.filter(item => {
    const haystack = normalize([item.marka,item.anaFirma,item.kategori,item.alternatif,item.kod].join(" "));
    const okSearch = !q || haystack.includes(q);
    const okFilter = currentFilter === "all" || item.durum === currentFilter;
    return okSearch && okFilter;
  });

  if(!list.length){
    results.innerHTML = `<div class="empty">Sonuç bulunamadı.<br>Bu markayı “İnceleniyor” olarak ekleyebilirsin.</div>`;
    return;
  }

  list.slice(0,80).forEach(item => {
    const tpl = document.getElementById("cardTemplate").content.cloneNode(true);
    const card = tpl.querySelector(".card");
    card.classList.add(item.durum || "inceleniyor");
    tpl.querySelector(".status").textContent = labels[item.durum] || "⚪ İNCELENİYOR";
    tpl.querySelector("h2").textContent = item.marka || "-";
    tpl.querySelector(".firma").textContent = item.anaFirma || "-";
    tpl.querySelector(".kategori").textContent = item.kategori || "-";
    tpl.querySelector(".kod").textContent = item.kod || "-";
    tpl.querySelector(".alternatif").textContent = item.alternatif || "-";
    tpl.querySelector(".note").textContent = item.not || "";
    const a = tpl.querySelector(".source");
    if(item.kaynak){ a.href = item.kaynak; } else { a.hidden = true; }
    results.appendChild(tpl);
  });
}

document.getElementById("search").addEventListener("input", render);
document.querySelectorAll("[data-filter]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll("[data-filter]").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js");
}

loadData();
