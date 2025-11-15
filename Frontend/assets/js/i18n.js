/*  i18n.js – Sistema de traducción completo
    - Lee archivos JSON de /assets/i18n
    - Guarda idioma en localStorage
    - Aplica traducción en todas las páginas
*/

(function () {
  const LANG_KEY = "site_lang";
  const DEFAULT_LANG = "es";

  let currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  let translations = {};

  const translateBtn = document.getElementById("translateBtn");
  const translatePanel = document.getElementById("translatePanel");
  const langList = document.getElementById("langList");

  const SUPPORTED_LANGS = [
    { code: "es", name: "Español" },
    { code: "qu", name: "Quechua" },
    { code: "ay", name: "Aymara" }
  ];

  // -------------------------------------------------------------
  // Renderiza la lista de idiomas
  // -------------------------------------------------------------
  function renderLangList() {
    if (!langList) return;

    langList.innerHTML = "";
    SUPPORTED_LANGS.forEach(lang => {
      const item = document.createElement("div");
      item.className = "lang-item rounded-md px-2 py-2 cursor-pointer";
      item.setAttribute("data-lang", lang.code);

      if (lang.code === currentLang) item.classList.add("active");

      item.innerHTML = `
        <div class="flex-1 text-sm text-text-light dark:text-text-dark">${lang.name}</div>
        <div class="text-xs text-secondary-text-light dark:text-secondary-text-dark">${lang.code}</div>
      `;

      item.onclick = () => selectLang(lang.code);
      langList.appendChild(item);
    });
  }

  // -------------------------------------------------------------
  // Seleccionar idioma
  // -------------------------------------------------------------
  async function selectLang(code) {
    currentLang = code;
    localStorage.setItem(LANG_KEY, code);

    await loadTranslations(code);
    applyTranslations();

    renderLangList();
    translatePanel.classList.add("hidden");
  }

  // -------------------------------------------------------------
  // Cargar archivo JSON
  // -------------------------------------------------------------
  async function loadTranslations(code) {
    try {
      const res = await fetch(`../assets/i18n/${code}.json`);
      if (!res.ok) throw new Error(`Error cargando ${code}.json`);
      translations = await res.json();
    } catch (err) {
      console.error("ERROR I18N:", err);
      translations = {};
    }
  }

  // -------------------------------------------------------------
  // Obtener texto de clave
  // -------------------------------------------------------------
  function t(key) {
    const parts = key.split(".");
    let ref = translations;

    for (let p of parts) {
      if (ref[p] === undefined) return "";
      ref = ref[p];
    }
    return typeof ref === "string" ? ref : "";
  }

  // -------------------------------------------------------------
  // Aplicar traducciones a toda la página
  // -------------------------------------------------------------
  function applyTranslations(root = document) {
    const nodes = root.querySelectorAll("[data-i18n]");
    nodes.forEach(el => {
      const key = el.getAttribute("data-i18n");
      const txt = t(key);

      if (txt) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = txt;
        } else {
          el.textContent = txt;
        }
      }
    });

    const titleKey = document.querySelector("title")?.getAttribute("data-i18n");
    if (titleKey) {
      const titleTxt = t(titleKey);
      if (titleTxt) document.title = titleTxt;
    }
  }

  // -------------------------------------------------------------
  // Inicialización
  // -------------------------------------------------------------
  async function init() {
    renderLangList();

    if (translateBtn && translatePanel) {
      translateBtn.onclick = (e) => {
        e.stopPropagation();
        translatePanel.classList.toggle("hidden");
      };

      document.addEventListener("click", (e) => {
        if (!translatePanel.contains(e.target) && !translateBtn.contains(e.target)) {
          translatePanel.classList.add("hidden");
        }
      });
    }

    await loadTranslations(currentLang);
    applyTranslations();

    window.applyTranslations = applyTranslations;
  }

  init();
})();
