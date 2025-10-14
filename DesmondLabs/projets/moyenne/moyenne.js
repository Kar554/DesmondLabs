const tableBody = document.getElementById("tableBody");
const addRowBtn = document.getElementById("addRow");
const calculateBtn = document.getElementById("calculate");
const globalAverage = document.getElementById("globalAverage");

// Charger les données sauvegardées
window.addEventListener("load", () => {
  const savedData = JSON.parse(localStorage.getItem("gradesData")) || [];
  savedData.forEach(data => addRow(data));
  calculateAll();
});

// Ajouter une matière
addRowBtn.addEventListener("click", () => addRow());

// Fonction pour ajouter une ligne
function addRow(data = {}) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="subject" value="${data.subject || ''}" placeholder="Ex: Mathématiques"></td>
    <td><input type="number" class="interro1" min="0" max="20" value="${data.interro1 || ''}"></td>
    <td><input type="number" class="interro2" min="0" max="20" value="${data.interro2 || ''}"></td>
    <td><input type="number" class="interro3" min="0" max="20" value="${data.interro3 || ''}"></td>
    <td><input type="number" class="devoir1" min="0" max="20" value="${data.devoir1 || ''}"></td>
    <td><input type="number" class="devoir2" min="0" max="20" value="${data.devoir2 || ''}"></td>
    <td class="moyInterro">-</td>
    <td class="moyTotale">-</td>
    <td><input type="number" class="coef" min="1" value="${data.coef || 1}"></td>
    <td class="moyCoef">-</td>
    <td><button class="remove-btn">❌</button></td>
  `;

  tableBody.appendChild(row);
  row.addEventListener("input", calculateAll);
  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
    saveData();
    calculateAll();
  });
}

// Calcul automatique
function calculateAll() {
  let totalMoyenne = 0;
  let totalCoef = 0;

  const rows = tableBody.querySelectorAll("tr");
  const dataToSave = [];

  rows.forEach(row => {
    const interro1 = parseFloat(row.querySelector(".interro1").value) || 0;
    const interro2 = parseFloat(row.querySelector(".interro2").value) || 0;
    const interro3 = parseFloat(row.querySelector(".interro3").value) || 0;
    const devoir1 = parseFloat(row.querySelector(".devoir1").value) || 0;
    const devoir2 = parseFloat(row.querySelector(".devoir2").value) || 0;
    const coef = parseFloat(row.querySelector(".coef").value) || 1;

    const moyInterro = ((interro1 + interro2 + interro3) / 3).toFixed(2);
    const moyTotale = ((parseFloat(moyInterro) + devoir1 + devoir2) / 3).toFixed(2);
    const moyCoef = (moyTotale * coef).toFixed(2);

    row.querySelector(".moyInterro").textContent = moyInterro;
    row.querySelector(".moyTotale").textContent = moyTotale;
    row.querySelector(".moyCoef").textContent = moyCoef;

    totalMoyenne += parseFloat(moyTotale) * coef;
    totalCoef += coef;

    // Sauvegarde de la ligne
    dataToSave.push({
      subject: row.querySelector(".subject").value,
      interro1, interro2, interro3, devoir1, devoir2, coef
    });
  });

  const moyenneGenerale = totalCoef > 0 ? (totalMoyenne / totalCoef).toFixed(2) : "-";
  globalAverage.innerHTML = moyenneGenerale !== "-" ?
    `🎯 Moyenne Générale : <strong style="color:${moyenneGenerale >= 10 ? '#10b981' : '#ef4444'}">${moyenneGenerale}/20</strong>` :
    "⚠️ Ajoute au moins une matière valide.";

  // Sauvegarder les données localement
  localStorage.setItem("gradesData", JSON.stringify(dataToSave));
}

// Recalculer manuellement
calculateBtn.addEventListener("click", calculateAll);

// Sauvegarde manuelle
function saveData() {
  const rows = tableBody.querySelectorAll("tr");
  const dataToSave = [];

  rows.forEach(row => {
    dataToSave.push({
      subject: row.querySelector(".subject").value,
      interro1: parseFloat(row.querySelector(".interro1").value) || 0,
      interro2: parseFloat(row.querySelector(".interro2").value) || 0,
      interro3: parseFloat(row.querySelector(".interro3").value) || 0,
      devoir1: parseFloat(row.querySelector(".devoir1").value) || 0,
      devoir2: parseFloat(row.querySelector(".devoir2").value) || 0,
      coef: parseFloat(row.querySelector(".coef").value) || 1
    });
  });

  localStorage.setItem("gradesData", JSON.stringify(dataToSave));
}
