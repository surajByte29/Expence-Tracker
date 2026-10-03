const form = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const list = document.getElementById("transactionList");
const emptyState = document.getElementById("emptyState");
const filter = document.getElementById("filter");
const themeBtn = document.getElementById("themeBtn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

dateInput.value = new Date().toISOString().split("T")[0];

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(value);
}

function updateSummary() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  document.getElementById("income").textContent = formatMoney(income);
  document.getElementById("expense").textContent = formatMoney(expense);
  document.getElementById("balance").textContent = formatMoney(income - expense);
}

function renderTransactions() {
  const selected = filter.value;

  const filtered = transactions
    .filter(t => selected === "all" || t.type === selected)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  list.innerHTML = "";
  document.getElementById("transactionCount").textContent =
    `${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`;

  emptyState.style.display = filtered.length ? "none" : "block";

  filtered.forEach(t => {
    const item = document.createElement("div");
    item.className = "transaction";

    const icon = t.type === "income" ? "💵" : getCategoryIcon(t.category);
    const sign = t.type === "income" ? "+" : "-";

    item.innerHTML = `
      <div class="transaction-icon">${icon}</div>
      <div class="transaction-info">
        <strong>${escapeHTML(t.description)}</strong>
        <small>${escapeHTML(t.category)} • ${formatDate(t.date)}</small>
      </div>
      <div class="transaction-amount ${t.type}">
        ${sign}${formatMoney(t.amount)}
      </div>
      <button class="delete-btn" aria-label="Delete transaction" onclick="deleteTransaction('${t.id}')">🗑️</button>
    `;

    list.appendChild(item);
  });

  updateSummary();
}

function getCategoryIcon(category) {
  const icons = {
    Food: "🍔",
    Transport: "🚌",
    Shopping: "🛍️",
    Bills: "🧾",
    Entertainment: "🎬",
    Salary: "💼",
    Other: "📌"
  };
  return icons[category] || "📌";
}

function formatDate(date) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  renderTransactions();
}

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (!description || amount <= 0) {
    alert("Please enter a valid description and amount.");
    return;
  }

  transactions.push({
    id: Date.now().toString(),
    description,
    amount,
    type: typeInput.value,
    category: categoryInput.value,
    date: dateInput.value
  });

  saveTransactions();
  renderTransactions();

  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
  descriptionInput.focus();
});

filter.addEventListener("change", renderTransactions);

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", dark);
  themeBtn.textContent = dark ? "☀️" : "🌙";
});

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀️";
}

if (transactions.length === 0) {
  transactions = [
    {
      id: "sample-1",
      description: "Monthly Salary",
      amount: 15000,
      type: "income",
      category: "Salary",
      date: new Date().toISOString().split("T")[0]
    },
    {
      id: "sample-2",
      description: "Lunch",
      amount: 250,
      type: "expense",
      category: "Food",
      date: new Date().toISOString().split("T")[0]
    }
  ];
  saveTransactions();
}

renderTransactions();
