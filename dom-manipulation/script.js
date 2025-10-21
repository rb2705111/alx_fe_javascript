// ==========================
// CONFIGURATION & CONSTANTS
// ==========================

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

let quotes = [];
let selectedCategory = "all";

// LocalStorage keys
const STORAGE_KEY = 'quotes';
const LAST_FILTER_KEY = 'lastSelectedFilter';
const LAST_SYNC_KEY = 'lastSyncTimestamp';

// SessionStorage keys
const SESSION_LAST_QUOTE_KEY = 'lastViewedQuote';
const SESSION_VIEW_COUNT_KEY = 'quoteViewCount';

// Sync settings
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 30000; // 30 seconds

let syncIntervalId = null;
let isSyncing = false;

// ==========================
// STORAGE UTILITIES
// ==========================

function saveLastFilter(category) {
  try {
    localStorage.setItem(LAST_FILTER_KEY, category);
  } catch (e) {
    console.error('Failed to save filter preference:', e);
  }
}

function loadLastFilter() {
  try {
    return localStorage.getItem(LAST_FILTER_KEY) || 'all';
  } catch (e) {
    console.error('Failed to load filter preference:', e);
    return 'all';
  }
}

function loadQuotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      quotes = JSON.parse(stored);
    } else {
      quotes = [...defaultQuotes];
      saveQuotes();
    }
  } catch (e) {
    console.error('Failed to load quotes:', e);
    quotes = [...defaultQuotes];
    showNotification('Error loading quotes. Using defaults.', 'error');
  }
}

function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error('Failed to save quotes:', e);
    showNotification('Storage full or unavailable.', 'error');
  }
}

function saveLastViewedQuote(quote) {
  try {
    sessionStorage.setItem(SESSION_LAST_QUOTE_KEY, JSON.stringify(quote));
    const count = (parseInt(sessionStorage.getItem(SESSION_VIEW_COUNT_KEY)) || 0) + 1;
    sessionStorage.setItem(SESSION_VIEW_COUNT_KEY, count.toString());
  } catch (e) {
    console.error('Session storage error:', e);
  }
}

function getLastViewedQuote() {
  try {
    const item = sessionStorage.getItem(SESSION_LAST_QUOTE_KEY);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}

// ==========================
// UI & QUOTE DISPLAY
// ==========================

function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    display.innerHTML = '<p class="empty-state">No quotes available in this category. Add some!</p>';
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  saveLastViewedQuote(randomQuote);

  display.innerHTML = '';
  const textEl = document.createElement('p');
  textEl.className = 'quote-text';
  textEl.textContent = `"${randomQuote.text}"`;

  const catEl = document.createElement('p');
  catEl.className = 'quote-category';
  catEl.textContent = `— ${randomQuote.category}`;

  display.appendChild(textEl);
  display.appendChild(catEl);

  // Fade-in animation
  display.style.opacity = '0';
  setTimeout(() => {
    display.style.transition = 'opacity 0.5s ease-in';
    display.style.opacity = '1';
  }, 10);
}

function updateFilterInfo() {
  const info = document.getElementById('filterInfo');
  const text = document.getElementById('filterText');

  if (selectedCategory !== 'all') {
    const count = quotes.filter(q => q.category === selectedCategory).length;
    text.textContent = `Showing ${count} quote${count !== 1 ? 's' : ''} in "${selectedCategory}"`;
    info.style.display = 'flex';
  } else {
    info.style.display = 'none';
  }
}

// ==========================
// CATEGORY MANAGEMENT
// ==========================

function populateCategories() {
  const filter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))].sort();
  const current = filter.value;

  filter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });

  // Restore selection
  if (current !== 'all' && categories.includes(current)) {
    filter.value = current;
  } else {
    const last = loadLastFilter();
    if (last !== 'all' && categories.includes(last)) {
      filter.value = last;
      selectedCategory = last;
    }
  }

  updateFilterInfo();
}

function filterQuotes() {
  const filter = document.getElementById('categoryFilter');
  selectedCategory = filter.value;
  saveLastFilter(selectedCategory);
  updateFilterInfo();
  showRandomQuote();

  if (selectedCategory !== 'all') {
    const count = quotes.filter(q => q.category === selectedCategory).length;
    showNotification(
      `Filtered to ${selectedCategory}: ${count} quote${count !== 1 ? 's' : ''} available`,
      'info'
    );
  }
}

function clearFilter() {
  document.getElementById('categoryFilter').value = 'all';
  filterQuotes();
  showNotification('Filter cleared – showing all quotes', 'success');
}

// ==========================
// QUOTE MANAGEMENT
// ==========================

function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const catInput = document.getElementById('newQuoteCategory');

  const text = textInput.value.trim();
  const category = catInput.value.trim();

  if (!text || !category) {
    showNotification('Please enter both quote and category!', 'error');
    return;
  }

  const exists = quotes.some(q => q.text.toLowerCase() === text.toLowerCase());
  if (exists) {
    showNotification('This quote already exists!', 'error');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  textInput.value = '';
  catInput.value = '';
  showNotification('Quote added successfully!', 'success');
  showRandomQuote();
}

// ==========================
// IMPORT / EXPORT
// ==========================

function exportToJsonFile() {
  try {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification(`Exported ${quotes.length} quotes!`, 'success');
  } catch (e) {
    showNotification('Export failed.', 'error');
    console.error(e);
  }
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file || !file.name.endsWith('.json')) {
    showNotification('Please select a valid JSON file.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error('Expected array of quotes');

      const valid = imported.filter(q =>
        q.text && q.category &&
        typeof q.text === 'string' &&
        typeof q.category === 'string'
      );

      if (valid.length === 0) throw new Error('No valid quotes found');

      const replace = confirm(
        `Found ${valid.length} valid quotes.\n\n` +
        `OK → Replace all quotes\nCancel → Merge (skip duplicates)`
      );

      if (replace) {
        quotes = valid;
      } else {
        const existing = new Set(quotes.map(q => q.text.toLowerCase()));
        const newQuotes = valid.filter(q => !existing.has(q.text.toLowerCase()));
        quotes.push(...newQuotes);
        if (newQuotes.length < valid.length) {
          showNotification(
            `Imported ${newQuotes.length} new quotes (${valid.length - newQuotes.length} duplicates skipped)`,
            'success'
          );
        }
      }

      saveQuotes();
      populateCategories();
      showRandomQuote();
      showNotification(`Total quotes: ${quotes.length}`, 'success');
    } catch (e) {
      showNotification(`Import error: ${e.message}`, 'error');
      console.error(e);
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // Reset input
}

function clearAllQuotes() {
  if (confirm(
    'Delete ALL quotes?\nThis restores defaults and cannot be undone!'
  )) {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.clear();
    quotes = [...defaultQuotes];
    saveQuotes();
    selectedCategory = 'all';
    saveLastFilter('all');
    populateCategories();
    showRandomQuote();
    showNotification('All quotes cleared. Defaults restored.', 'success');
  }
}

// ==========================
// SERVER SYNC
// ==========================

async function fetchQuotesFromServer() {
  if (isSyncing) return;
  isSyncing = true;
  showNotification('Fetching quotes from server...', 'info');

  try {
    const res = await fetch(SERVER_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const posts = await res.json();
    const serverQuotes = posts.map(post => ({
      text: post.title,
      category: 'Remote'
    }));

    const existing = new Set(quotes.map(q => q.text.toLowerCase()));
    const newQuotes = serverQuotes.filter(q => !existing.has(q.text.toLowerCase()));

    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      populateCategories();
      showNotification(`Added ${newQuotes.length} new quotes from server.`, 'success');
    } else {
      showNotification('No new quotes from server.', 'info');
    }

    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (e) {
    console.error('Sync failed:', e);
    showNotification('Failed to sync with server.', 'error');
  } finally {
    isSyncing = false;
  }
}

function syncWithServer() {
  fetchQuotesFromServer(); // You can expand this later to also PUSH data
}

function startAutoSync() {
  if (syncIntervalId) clearInterval(syncIntervalId);
  syncIntervalId = setInterval(fetchQuotesFromServer, SYNC_INTERVAL);
}

// ==========================
// NOTIFICATIONS & INIT
// ==========================

function showNotification(message, type = 'success') {
  const colors = { success: '#4caf50', error: '#f44336', info: '#2196f3' };
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${colors[type] || colors.success};
    color: white; padding: 15px 25px;
    border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000; max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

function displaySessionInfo() {
  const views = sessionStorage.getItem(SESSION_VIEW_COUNT_KEY) || '0';
  const last = getLastViewedQuote();
  if (last && parseInt(views) > 0) {
    console.log(`Session: ${views} views | Last: "${last.text.substring(0, 50)}..."`);
  }
}

function initializeApp() {
  // Inject CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  `;
  document.head.appendChild(style);

  // Load data
  loadQuotes();
  populateCategories();

  // Restore filter
  const lastFilter = loadLastFilter();
  if (lastFilter !== 'all') {
    selectedCategory = lastFilter;
    document.getElementById('categoryFilter').value = lastFilter;
    console.log(`Restored filter: ${lastFilter}`);
  }

  // Show quote
  const lastQuote = getLastViewedQuote();
  showRandomQuote();

  // Event listeners
  document.getElementById('newQuote')?.addEventListener('click', showRandomQuote);
  document.getElementById('addQuoteBtn')?.addEventListener('click', addQuote);
  document.getElementById('categoryFilter')?.addEventListener('change', filterQuotes);
  document.getElementById('clearFilter')?.addEventListener('click', clearFilter);
  document.getElementById('exportQuotes')?.addEventListener('click', exportToJsonFile);
  document.getElementById('importFile')?.addEventListener('change', importFromJsonFile);
  document.getElementById('clearStorage')?.addEventListener('click', clearAllQuotes);
  document.getElementById('syncServer')?.addEventListener('click', syncWithServer);

  // Enter key support
  document.getElementById('newQuoteText')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('newQuoteCategory')?.focus();
  });
  document.getElementById('newQuoteCategory')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') addQuote();
  });

  // Start auto-sync
  startAutoSync();

  // Log session
  displaySessionInfo();
  console.log('App initialized.');
}

// Launch when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
