// Initial default quotes
const defaultQuotes = [
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

// Array to store quotes (will be loaded from localStorage)
let quotes = [];

// Variable to track the currently selected category
let selectedCategory = "all";

// Local Storage key
const STORAGE_KEY = 'quotes';
const LAST_FILTER_KEY = 'lastSelectedFilter';

// Session Storage keys
const SESSION_LAST_QUOTE_KEY = 'lastViewedQuote';
const SESSION_VIEW_COUNT_KEY = 'quoteViewCount';

/**
 * Load quotes from localStorage
 * If no quotes exist, use default quotes
 */
function loadQuotes() {
  try {
    const storedQuotes = localStorage.getItem(STORAGE_KEY);
    
    if (storedQuotes) {
      quotes = JSON.parse(storedQuotes);
      console.log(`Loaded ${quotes.length} quotes from localStorage`);
    } else {
      // First time - use default quotes
      quotes = [...defaultQuotes];
      saveQuotes();
      console.log('Initialized with default quotes');
    }
  } catch (error) {
    console.error('Error loading quotes from localStorage:', error);
    quotes = [...defaultQuotes];
    showNotification('Error loading saved quotes. Using defaults.', 'error');
  }
}

/**
 * Save quotes to localStorage
 */
function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    console.log(`Saved ${quotes.length} quotes to localStorage`);
  } catch (error) {
    console.error('Error saving quotes to localStorage:', error);
    showNotification('Error saving quotes. Storage may be full.', 'error');
  }
}

/**
 * Save last viewed quote to session storage
 */
function saveLastViewedQuote(quote) {
  try {
    sessionStorage.setItem(SESSION_LAST_QUOTE_KEY, JSON.stringify(quote));
    
    // Increment view count
    let viewCount = parseInt(sessionStorage.getItem(SESSION_VIEW_COUNT_KEY) || '0');
    viewCount++;
    sessionStorage.setItem(SESSION_VIEW_COUNT_KEY, viewCount.toString());
    
    console.log(`View count: ${viewCount}`);
  } catch (error) {
    console.error('Error saving to session storage:', error);
  }
}

/**
 * Get last viewed quote from session storage
 */
function getLastViewedQuote() {
  try {
    const lastQuote = sessionStorage.getItem(SESSION_LAST_QUOTE_KEY);
    return lastQuote ? JSON.parse(lastQuote) : null;
  } catch (error) {
    console.error('Error reading from session storage:', error);
    return null;
  }
}

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
  
  // Save to session storage
  saveLastViewedQuote(randomQuote);
  
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
    showNotification('Please enter both quote text and category!', 'error');
    return;
  }
  
  // Check for duplicate quotes
  const isDuplicate = quotes.some(q => 
    q.text.toLowerCase() === newQuoteText.value.trim().toLowerCase()
  );
  
  if (isDuplicate) {
    showNotification('This quote already exists!', 'error');
    return;
  }
  
  // Create new quote object
  const newQuote = {
    text: newQuoteText.value.trim(),
    category: newQuoteCategory.value.trim()
  };
  
  // Add to quotes array
  quotes.push(newQuote);
  
  // Save to localStorage
  saveQuotes();
  
  // Update category filter dropdown
  updateCategoryFilter();
  
  // Clear input fields
  newQuoteText.value = '';
  newQuoteCategory.value = '';
  
  // Show success feedback
  showNotification('Quote added and saved successfully!', 'success');
  
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
 * Export quotes to JSON file
 */
function exportToJsonFile() {
  try {
    // Create JSON string with proper formatting
    const jsonString = JSON.stringify(quotes, null, 2);
    
    // Create Blob from JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download URL
    const url = URL.createObjectURL(blob);
    
    // Create temporary anchor element for download
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Exported ${quotes.length} quotes successfully!`, 'success');
    console.log('Quotes exported to JSON file');
  } catch (error) {
    console.error('Error exporting quotes:', error);
    showNotification('Error exporting quotes to file.', 'error');
  }
}

/**
 * Import quotes from JSON file
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }
  
  // Verify file type
  if (!file.name.endsWith('.json')) {
    showNotification('Please select a valid JSON file.', 'error');
    return;
  }
  
  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    try {
      // Parse JSON content
      const importedQuotes = JSON.parse(e.target.result);
      
      // Validate imported data
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      // Validate each quote has required properties
      const validQuotes = importedQuotes.filter(q => 
        q.text && q.category && typeof q.text === 'string' && typeof q.category === 'string'
      );
      
      if (validQuotes.length === 0) {
        throw new Error('No valid quotes found in file');
      }
      
      // Ask user if they want to replace or merge
      const shouldReplace = confirm(
        `Found ${validQuotes.length} valid quotes.\n\n` +
        `Click OK to REPLACE all existing quotes.\n` +
        `Click Cancel to MERGE with existing quotes.`
      );
      
      if (shouldReplace) {
        quotes = validQuotes;
      } else {
        // Merge and remove duplicates
        const existingTexts = new Set(quotes.map(q => q.text.toLowerCase()));
        const newQuotes = validQuotes.filter(q => 
          !existingTexts.has(q.text.toLowerCase())
        );
        quotes.push(...newQuotes);
        
        if (newQuotes.length < validQuotes.length) {
          showNotification(
            `Imported ${newQuotes.length} new quotes (${validQuotes.length - newQuotes.length} duplicates skipped)`,
            'success'
          );
        }
      }
      
      // Save to localStorage
      saveQuotes();
      
      // Update UI
      updateCategoryFilter();
      showRandomQuote();
      
      showNotification(
        `Successfully imported! Total quotes: ${quotes.length}`,
        'success'
      );
      
      console.log(`Imported quotes. Total count: ${quotes.length}`);
    } catch (error) {
      console.error('Error importing quotes:', error);
      showNotification(`Import failed: ${error.message}`, 'error');
    }
  };
  
  fileReader.onerror = function() {
    showNotification('Error reading file.', 'error');
  };
  
  fileReader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
}

/**
 * Clear all quotes from storage
 */
function clearAllQuotes() {
  const confirmation = confirm(
    'Are you sure you want to delete ALL quotes?\n\n' +
    'This will remove all saved quotes and restore defaults.\n' +
    'This action cannot be undone!'
  );
  
  if (confirmation) {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Reset to default quotes
    quotes = [...defaultQuotes];
    saveQuotes();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Update UI
    updateCategoryFilter();
    showRandomQuote();
    
    showNotification('All quotes cleared and defaults restored.', 'success');
    console.log('Storage cleared, defaults restored');
  }
}

/**
 * Simulate syncing with server (demonstrating JSON handling)
 */
function syncWithServer() {
  showNotification('Syncing with server...', 'info');
  
  // Simulate API call with timeout
  setTimeout(() => {
    try {
      // Simulate serializing data for server
      const dataToSync = {
        quotes: quotes,
        lastSync: new Date().toISOString(),
        totalQuotes: quotes.length,
        categories: [...new Set(quotes.map(q => q.category))]
      };
      
      // Log the JSON that would be sent
      console.log('Data to sync:', JSON.stringify(dataToSync, null, 2));
      
      // Simulate successful sync
      showNotification(
        `Sync complete! ${quotes.length} quotes backed up to server.`,
        'success'
      );
    } catch (error) {
      console.error('Sync error:', error);
      showNotification('Sync failed. Please try again.', 'error');
    }
  }, 1500);
}

/**
 * Function to show a temporary notification
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.textContent = message;
  
  const colors = {
    success: '#4caf50',
    error: '#f44336',
    info: '#2196f3'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.success};
    color: white;
    padding: 15px 25px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
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
 * Display session information
 */
function displaySessionInfo() {
  const viewCount = sessionStorage.getItem(SESSION_VIEW_COUNT_KEY) || '0';
  const lastQuote = getLastViewedQuote();
  
  if (lastQuote && parseInt(viewCount) > 0) {
    console.log(`Session Info - Views: ${viewCount}, Last Quote: "${lastQuote.text.substring(0, 50)}..."`);
  }
}

/**
 * Initialize the application
 */
function initializeApp() {
  // Load quotes from localStorage
  loadQuotes();
  
  // Set up event listeners
  const newQuoteBtn = document.getElementById('newQuote');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const categoryFilter = document.getElementById('categoryFilter');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  const exportBtn = document.getElementById('exportQuotes');
  const importFile = document.getElementById('importFile');
  const clearBtn = document.getElementById('clearStorage');
  const syncBtn = document.getElementById('syncServer');
  
  // Button click events
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  exportBtn.addEventListener('click', exportToJsonFile);
  importFile.addEventListener('change', importFromJsonFile);
  clearBtn.addEventListener('click', clearAllQuotes);
  syncBtn.addEventListener('click', syncWithServer);
  
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
  
  // Check if there's a last viewed quote from session
  const lastQuote = getLastViewedQuote();
  if (lastQuote) {
    console.log('Restoring last viewed quote from session');
    // Display the last viewed quote or show a new one
    showRandomQuote();
  } else {
    // Display initial quote
    showRandomQuote();
  }
  
  // Display session info in console
  displaySessionInfo();
  
  console.log('App initialized with localStorage and sessionStorage');
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

// Log storage usage (for debugging)
console.log('Local Storage Usage:', localStorage.length, 'items');
console.log('Session Storage Usage:', sessionStorage.length, 'items');
