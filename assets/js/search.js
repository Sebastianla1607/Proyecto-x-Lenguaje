// Reusable search helper used by pages with a `#searchInput` and `#searchResults` UI.
(function () {
  const API = "https://api-nodepost-production.up.railway.app/candidatos";
  const input = document.getElementById("searchInput");
  const resultsEl = document.getElementById("searchResults");
  if (!input || !resultsEl) return;

  let debounce = null;

  function clear() {
    resultsEl.innerHTML = "";
    resultsEl.classList.add("hidden");
  }

  function render(items) {
    resultsEl.innerHTML = "";
    if (!items || items.length === 0) {
      const li = document.createElement("li");
      li.className = "px-3 py-2 text-sm text-gray-500";
      li.textContent = "No hay resultados";
      resultsEl.appendChild(li);
      resultsEl.classList.remove("hidden");
      return;
    }

    for (const c of items.slice(0, 8)) {
      const li = document.createElement("li");
      li.className =
        "px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3";
      const img = document.createElement("img");
      img.src = c.foto_url || c.photo || "https://via.placeholder.com/64";
      img.alt = c.nombre || c.name || "";
      img.className = "w-10 h-10 rounded-full object-cover";
      const txt = document.createElement("div");
      const name = document.createElement("div");
      name.className =
        "text-sm font-semibold text-[#181611] dark:text-gray-100";
      name.textContent = c.nombre || c.name || "";
      const meta = document.createElement("div");
      meta.className = "text-xs text-gray-600 dark:text-gray-400";
      meta.textContent = (c.cargo ? c.cargo + " · " : "") + (c.ciudad || "");
      txt.appendChild(name);
      txt.appendChild(meta);
      li.appendChild(img);
      li.appendChild(txt);
      li.addEventListener("click", () => {
        location.href = `Candidato_Perfil.html?id=${encodeURIComponent(c.id)}`;
      });
      resultsEl.appendChild(li);
    }
    resultsEl.classList.remove("hidden");
  }

  async function tryApiSearch(q) {
    const params = ["q", "search", "nombre", "name"];
    for (const p of params) {
      try {
        const url = `${API}?${p}=${encodeURIComponent(q)}`;
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) continue;
        const j = await r.json();
        const arr = Array.isArray(j)
          ? j
          : j.candidatos || j.results || j.data || j;
        if (Array.isArray(arr) && arr.length > 0) return arr;
      } catch (e) {
        console.debug("tryApiSearch error for param", p, e);
      }
    }
    return null;
  }

  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      const q = input.value && input.value.trim();
      if (!q) {
        clear();
        return;
      }
      const apiRes = await tryApiSearch(q);
      if (apiRes) {
        render(apiRes);
        return;
      }
      if (
        globalThis.CANDIDATES_DATA &&
        Array.isArray(globalThis.CANDIDATES_DATA)
      ) {
        const term = q.toLowerCase();
        const matches = globalThis.CANDIDATES_DATA.filter((c) => {
          const name = (c.nombre || c.name || "").toLowerCase();
          const cargo = (c.cargo || "").toLowerCase();
          const city = (c.ciudad || "").toLowerCase();
          const sigla = (c.sigla || c.party_sigla || "").toString().toLowerCase();
          const partyName = (c.party_name || c.partido || c.party || "").toString().toLowerCase();
          return (
            name.includes(term) ||
            cargo.includes(term) ||
            city.includes(term) ||
            sigla.includes(term) ||
            partyName.includes(term)
          );
        }).slice(0, 8);
        render(matches);
        // Además, filtrar la lista principal si está presente en la página
        try {
          filterMainList(term);
        } catch (e) {
          /* no bloquear si falla */
        }
      } else {
        clear();
      }
    }, 260);
  });

  document.addEventListener("click", (ev) => {
    if (!resultsEl.contains(ev.target) && ev.target !== input) clear();
  });
})();

// Filtrado auxiliar para la lista ya rendereada en `#candidates-list`.
function filterMainList(term) {
  if (typeof term === "undefined") return;
  const list = document.getElementById("candidates-list");
  if (!list) return;
  const anchors = list.querySelectorAll("a");
  const q = (term || "").toLowerCase();
  let visible = 0;
    for (const a of anchors) {
    const text = (a.innerText || '').toLowerCase();
    const dsig = (a.dataset && a.dataset.sigla ? a.dataset.sigla.toLowerCase() : '');
    if (!q || q.trim() === "") {
      a.style.display = "";
      visible++;
      continue;
    }
    if (text.includes(q) || dsig.includes(q)) {
      a.style.display = "";
      visible++;
    } else {
      a.style.display = "none";
    }
  }
  // Si no hay coincidencias, mostrar mensaje breve
  const existingNote = document.getElementById("no-candidates-found");
  // Si el dropdown de sugerencias está visible, no añadimos la nota en la lista principal
  const resultsEl = document.getElementById("searchResults");
  const resultsVisible = resultsEl && !resultsEl.classList.contains("hidden");
  if (visible === 0) {
    if (!existingNote && !resultsVisible) {
      const p = document.createElement("p");
      p.id = "no-candidates-found";
      p.className = "text-sm text-gray-500 py-2";
      p.textContent = "No se encontraron candidatos para la búsqueda.";
      list.appendChild(p);
    }
  } else {
    if (existingNote) {
      existingNote.remove();
    }
  }
}
