// Array to store quotes with text and category
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Motivation" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "Wisdom" },
  { text: "Your time is limited, don't waste it living someone else's life.", category: "Life" },
  { text: "Code is like humor. When you have to explain it, it's bad.", category: "Technology" },
  { text: "The only impossible journey is the one you never begin.", category: "Inspiration" },
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration" }
];

// Variable to track the currently selected category
let selectedCategory = "all";

/**
 * Function to display a random quote from the quotes array
 * Filters by selected category if applicable
 */
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  
  // Filter quotes based on selected category
  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  // Check if there are quotes to display
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<p class="empty-state">No quotes available in this category. Add some!</p>';
    return;
  }
  
  // Get a random quote from filtered quotes
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  // Clear previous content
  quoteDisplay.innerHTML = '';
  
  // Create and append quote text element
  const quoteText = document.createElement('p');
  quoteText.className = 'quote-text';
  quoteText.textContent = `"${randomQuote.text}"`;
  
  // Create and append category element
  const quoteCategory = document.createElement('p');
  quoteCategory.className = 'quote-category';
  quoteCategory.textContent = `— ${randomQuote.category}`;
  
  // Append elements to display
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
  
  // Add animation effect
  quoteDisplay.style.opacity = '0';
  setTimeout(() => {
    quoteDisplay.style.transition = 'opacity 0.5s ease-in';
    quoteDisplay.style.opacity = '1';
  }, 10);
}

/**
 * Function to create and manage the add quote form
 * This function is called when a new quote is added
 */
function createAddQuoteForm() {
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  
  // Validate inputs
  if (!newQuoteText.value.trim() || !newQuoteCategory.value.trim()) {
    alert('Please enter both quote text and category!');
    return;
  }
  
  // Create new quote object
  const newQuote = {
    text: newQuoteText.value.trim(),
    category: newQuoteCategory.value.trim()
  };
  
  // Add to quotes array
  quotes.push(newQuote);
  
  // Update category filter dropdown
  updateCategoryFilter();
  
  // Clear input fields
  newQuoteText.value = '';
  newQuoteCategory.value = '';
  
  // Show success feedback
  showNotification('Quote added successfully!');
  
  // Automatically display the new quote
  showRandomQuote();
}

/**
 * Function to add a new quote to the array
 * This is called from the Add Quote button
 */
function addQuote() {
  createAddQuoteForm();
}

/**
 * Function to update the category filter dropdown
 * Extracts unique categories from quotes array
 */
function updateCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Store current selection
  const currentSelection = categoryFilter.value;
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add category options
  categories.sort().forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore previous selection if it still exists
  if (currentSelection !== 'all' && categories.includes(currentSelection)) {
    categoryFilter.value = currentSelection;
  }
}

/**
 * Function to show a temporary notification
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 15px 25px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Function to handle category filter changes
 */
function handleCategoryChange() {
  const categoryFilter = document.getElementById('categoryFilter');
  selectedCategory = categoryFilter.value;
  showRandomQuote();
}

/**
 * Initialize the application
 */
function initializeApp() {
  // Set up event listeners
  const newQuoteBtn = document.getElementById('newQuote');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const categoryFilter = document.getElementById('categoryFilter');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  
  // Button click events
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  
  // Category filter change event
  categoryFilter.addEventListener('change', handleCategoryChange);
  
  // Allow Enter key to add quote
  newQuoteText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      newQuoteCategory.focus();
    }
  });
  
  newQuoteCategory.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addQuote();
    }
  });
  
  // Populate category filter
  updateCategoryFilter();
  
  // Display initial quote
  showRandomQuote();
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
