// ==== DOM Elements ====
const inputEl = document.getElementById("input-el");
const addBtn = document.getElementById("input-btn");
const saveBtn = document.getElementById("input-save");
const deleteBtn = document.getElementById("input-del");
const listEl = document.getElementById("ul-el");

// ==== State ====
let myLeads = JSON.parse(localStorage.getItem("myLeads")) || [];

// Initial render
renderLeads();

// ==== Functions ====
function addLead() {
  let value = inputEl.value;
  if (value.replace(/\s/g, "").length === 0) return;
  value = value.replace(/\n+$/g, "");
  myLeads.push({ value, type: "text" });
  inputEl.value = "";
  updateStorage();
  renderLeads();
}
function saveTab() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (!tabs[0]?.url) return;
    myLeads.push({ value: tabs[0].url, type: "tab" });
    updateStorage();
    renderLeads();
  });
}
function deleteLeads() {
  myLeads = [];
  updateStorage();
  renderLeads();
}
function deleteLast() {
  myLeads.pop();
  updateStorage();
  renderLeads();
}
function updateStorage() {
  localStorage.setItem("myLeads", JSON.stringify(myLeads));
}
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderLeads() {
  listEl.innerHTML = myLeads
    .map(({ value, type }, index) => {
      const safe = escapeHTML(value);

      const content =
        type === "text"
          ? `<code class="lead-text">${safe}</code>`
          : `<a href="${value}" target="_blank">${value}</a>`;

      return `
        <li class="lead-item">
          <button class="delete-item-btn" data-index="${index}">X</button>
          ${content}
          <button class="copy-btn" data-value="${safe}">
          &#128203
          </button>
        </li>`;
    })
    .join("");

  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-value");
      navigator.clipboard.writeText(value);

      btn.innerHTML = "&#9989";
      setTimeout(() => {
        btn.innerHTML = "&#128203";
      }, 1200);
    });
  });

  document.querySelectorAll(".delete-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-index"));
      myLeads.splice(i, 1);
      updateStorage();
      renderLeads();
    });
  });
}

// ==== Event Listeners ====
addBtn.addEventListener("click", addLead);
saveBtn.addEventListener("click", saveTab);
deleteBtn.addEventListener("dblclick", deleteLeads);
inputEl.addEventListener("keydown", (e) => {
  const isMac = navigator.userAgentData?.platform === "macOS";
  const submitKey = isMac
    ? e.metaKey && e.key === "Enter"
    : e.ctrlKey && e.key === "Enter";

  if (submitKey) {
    addLead();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    saveTab();
  }
  if (e.key === "ArrowUp") {
    deleteLast();
  }
});
