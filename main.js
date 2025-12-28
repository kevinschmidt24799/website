// MathJax configuration (must be set before loading MathJax)
window.MathJax = {
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
};

// Load MathJax
(function () {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
  script.async = true;
  document.head.appendChild(script);
})();

// Convert LaTeX markup to HTML (preserves $...$ math for MathJax)
function texToHtml(tex, skipSection = null) {
  const match = tex.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (!match) return null;
  let content = match[1];
  if (skipSection) {
    content = content.replace(new RegExp(`\\\\section\\*\\{${skipSection}\\}\\s*`), "");
  }
  return content
    .replace(/\\section\*\{([^}]+)\}/g, "<h3>$1</h3>")
    .replace(/\\subsection\*\{([^}]+)\}/g, "<h4>$1</h4>")
    .replace(/---/g, "—")
    .replace(/``/g, '"')
    .replace(/''/g, '"')
    .replace(/\\ldots/g, "…")
    .replace(/\\'\{([^}])\}/g, "$1́")
    .replace(/\\'([a-zA-Z])/g, "$1́")
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${p.trim()}</p>`)
    .join("\n");
}

// Load a .tex file and render it into an element
function loadTex(texFile, elementId, skipSection = null) {
  fetch(texFile)
    .then((r) => r.text())
    .then((tex) => {
      const html = texToHtml(tex, skipSection);
      const el = document.getElementById(elementId);
      if (html) {
        el.innerHTML = html;
        // Wait for MathJax to be ready, then typeset
        (function typeset() {
          if (window.MathJax?.typesetPromise) {
            MathJax.typesetPromise([el]);
          } else {
            setTimeout(typeset, 100);
          }
        })();
      } else {
        el.innerHTML = "<p>Could not parse content.</p>";
      }
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      document.getElementById(elementId).innerHTML =
        "<p>Could not load content.</p>";
    });
}

// Load last updated date and year
fetch("last_updated.txt")
  .then((r) => r.text())
  .then((txt) => {
    document.getElementById("last-updated").textContent = txt.trim();
    // Extract year (assumes format like "Last updated 11/27/2025" or similar with 4-digit year)
    const yearMatch = txt.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const el = document.getElementById("last-updated-year");
      if (el) el.textContent = yearMatch[1];
    }
  });
