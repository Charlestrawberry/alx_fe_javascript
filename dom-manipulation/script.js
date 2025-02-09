const quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The only way to do great work is to love what you do.",
    category: "Motivation",
  },
  {
    text: "In the middle of every difficulty lies opportunity.",
    category: "Inspiration",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    category: "Perseverance",
  },
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  if (quotes.length === 0) {
    console.error("No quotes available.");
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quoteDisplay) {
    quoteDisplay.innerHTML = `<p> "${quotes[randomIndex].text}" <br> - <em>${quotes[randomIndex].category}</em> </p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showRandomQuote();
  createAddQuoteForm();

  const showNewQuoteButton = document.getElementById("newQuote");
  if (showNewQuoteButton) {
    showNewQuoteButton.addEventListener("click", showRandomQuote);
  }

  // Restore last viewed quote from session storage
  const lastViewedQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));
  if (lastViewedQuote) {
    document.getElementById("quoteDisplay").innerHTML = `<p> "${lastViewedQuote.text}" <br> - <em>${lastViewedQuote.category}</em> </p>`;
  }
});

function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  const existingForm = document.getElementById("quoteFormContainer");
  if (!existingForm) {
    document.body.appendChild(formContainer); // Prevent multiple forms from being added
  }
}

function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
    showRandomQuote();
  } else {
    alert("Please enter both a quote and a category.");
  }
}


function exportToJsonFile() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quotes));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "quotes.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}

document.body.innerHTML += '<button onclick="exportToJsonFile()">Export Quotes</button>';
document.body.innerHTML += '<input type="file" id="importFile" accept=".json" onchange="importFromJsonFile(event)" />';

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
    showRandomQuote();
  };
  fileReader.readAsText(event.target.files[0]);
}
