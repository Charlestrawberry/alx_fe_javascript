// Initialize quotes array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
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

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote
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

// Populate categories dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  const categoryFilter = document.getElementById("categoryFilter");

  // Clear existing options (except "All Categories")
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Add new options
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore the last selected filter from localStorage
  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) {
    categoryFilter.value = lastFilter;
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(quote => quote.category === selectedCategory);

  // Save the selected filter to localStorage
  localStorage.setItem("lastFilter", selectedCategory);

  // Display filtered quotes
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = filteredQuotes.map(quote => `
    <p> "${quote.text}" <br> - <em>${quote.category}</em> </p>
  `).join("");
}

// Add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);

    // Save quotes to localStorage
    saveQuotes();

    // Update categories dropdown
    populateCategories();

    // Clear input fields
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    // Post the new quote to the server
    postQuoteToServer(newQuote);

    alert("Quote added successfully!");
    filterQuotes(); // Refresh displayed quotes
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Create the "Add Quote" form
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
    document.body.appendChild(formContainer);
  }
}

// Export quotes to a JSON file
function exportToJsonFile() {
  const jsonString = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadAnchor = document.createElement("a");
  downloadAnchor.href = url;
  downloadAnchor.download = "quotes.json";
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (file && file.type === "application/json") {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
      populateCategories();
      filterQuotes();
    };
    fileReader.readAsText(file);
  } else {
    alert("Please upload a valid JSON file.");
  }
}

// Simulate server interaction
const API_URL = "https://jsonplaceholder.typicode.com/posts"; // Replace with your API endpoint

// Fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data.map(post => ({ text: post.title, category: "Server" })); // Mock quotes
  } catch (error) {
    console.error("Failed to fetch quotes from server:", error);
    return [];
  }
}

// Post a new quote to the server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(API_URL, {
      method: "POST", // Use POST method
      headers: {
        "Content-Type": "application/json", // Set content type to JSON
      },
      body: JSON.stringify(quote), // Send the quote as JSON
    });

    if (!response.ok) {
      throw new Error("Failed to post quote to server.");
    }

    const data = await response.json();
    console.log("Quote posted to server:", data);
  } catch (error) {
    console.error("Error posting quote to server:", error);
  }
}

// Sync quotes with the server
async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();

  // Check for conflicts
  const conflicts = serverQuotes.filter(serverQuote =>
    quotes.some(localQuote => localQuote.text === serverQuote.text && localQuote.category !== serverQuote.category)
  );

  if (conflicts.length > 0) {
    notifyUser("Conflicts detected. Server data will take precedence.");
  }

  // Merge server quotes with local quotes
  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(localQuote => localQuote.text === serverQuote.text);
    if (!exists) {
      quotes.push(serverQuote);
    }
  });

  // Save updated quotes to localStorage
  saveQuotes();

  // Refresh the UI
  populateCategories();
  filterQuotes();
}

// Notify the user of updates or conflicts
function notifyUser(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.backgroundColor = "#333";
  notification.style.color = "#fff";
  notification.style.padding = "10px";
  notification.style.borderRadius = "5px";
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 5000);
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  showRandomQuote();
  createAddQuoteForm();
  populateCategories();
  filterQuotes();

  // Sync with the server every 30 seconds
  setInterval(syncWithServer, 30000);
});