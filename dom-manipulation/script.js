// ==========================
// CONFIGURATION & DEFAULTS
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

// Storage keys
const STORAGE_KEY = 'quotes';
const LAST_FILTER_KEY = 'lastSelectedFilter';
const LAST_SYNC_KEY = 'lastSyncTimestamp';

// Sync config
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 30000; // 30 seconds

let syncIntervalId = null;
let isSyncing = false;

// ==========================
// STORAGE HELPERS
// ==========================

function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (e) {
    showNotification('Failed to save quotes (storage full?)', 'error');
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
    quotes = [...defaultQuotes];
    showNotification('Error loading quotes. Using defaults.', 'error');
  }
}

function saveLastFilter(cat) {
  localStorage.setItem(LAST_FILTER_KEY, cat);
}

function loadLastFilter() {
  return localStorage.getItem(LAST_FILTER_KEY) || 'all';
}

// ==========================
// UI & QUOTE DISPLAY
// ==========================

function showRandomQuote() {
  const el = document.getElementById('quoteDisplay');
  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    el.innerHTML = '<p class="empty-state">No quotes in this category.</p>';
    return;
  }

  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  el.innerHTML = `
    <p class="quote-text">"${quote.text}"</p>
    <p class="quote-category">— ${quote.category}</p>
  `;
}

function populateCategories() {
  const filter = document.getElementById('categoryFilter');
  const cats = [...new Set(quotes.map(q => q.category))].sort();
  let current = filter.value;

  filter.innerHTML = '<option value="all">All Categories</option>';
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });

  const lastFilter = loadLastFilter();
  if (lastFilter !== 'all' && cats.includes(lastFilter)) {
    filter.value = lastFilter;
    selectedCategory = lastFilter;
  } else if (current !== 'all' && cats.includes(current)) {
    filter.value = current;
  }

  updateFilterInfo();
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

function filterQuotes() {
  selectedCategory = document.getElementById('categoryFilter').value;
  saveLastFilter(selectedCategory);
  updateFilterInfo();
  showRandomQuote();
}

function clearFilter() {
  document.getElementById('categoryFilter').value = 'all';
  filterQuotes();
  showNotification('Filter cleared.', 'success');
}

// ==========================
// QUOTE MANAGEMENT
// ==========================

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const cat = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !cat) {
    showNotification('Enter both quote and category.', 'error');
    return;
  }

  const exists = quotes.some(q => q.text.toLowerCase() === text.toLowerCase());
  if (exists) {
    showNotification('Quote already exists!', 'error');
    return;
  }

  quotes.push({ text, category: cat });
  saveQuotes();
  populateCategories();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  showNotification('Quote added.', 'success');
  showRandomQuote();
}

// ==========================
// IMPORT / EXPORT
// ==========================

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quotes_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification(`Exported ${quotes.length} quotes.`, 'success');
}

function importFromJsonFile(e) {
  const file = e.target.files[0];
  if (!file || !file.name.endsWith('.json')) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      const valid = imported.filter(q => q.text && q.category);
      if (valid.length === 0) throw new Error('No valid quotes.');

      const replace = confirm(`Import ${valid.length} quotes?\nOK = Replace, Cancel = Merge`);
      if (replace) {
        quotes = valid;
      } else {
        const existing = new Set(quotes.map(q => q.text.toLowerCase()));
        const newQuotes = valid.filter(q => !existing.has(q.text.toLowerCase()));
        quotes.push(...newQuotes);
      }

      saveQuotes();
      populateCategories();
      showRandomQuote();
      showNotification(`Total: ${quotes.length} quotes.`, 'success');
    } catch (err) {
      showNotification('Import failed: invalid file.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function clearAllQuotes() {
  if (confirm('Reset all quotes to default?')) {
    quotes = [...defaultQuotes];
    saveQuotes();
    populateCategories();
    showRandomQuote();
    showNotification('Restored default quotes.', 'success');
  }
}

// ==========================
// SERVER SYNC & CONFLICT RESOLUTION
// ==========================

/**
 * Transforms a JSONPlaceholder post into a quote object.
 * Uses title as quote text, body preview as category (or "Remote").
 */
function transformPostToQuote(post) {
  const category = post.body.split('\n')[0].substring(0, 20).trim() || 'Remote';
  return {
    text: post.title,
    category: category.length > 0 ? category : 'Remote'
  };
}

/**
 * Detects conflicts: same quote text but different category.
 * Returns array of { local, remote } conflict pairs.
 */
function detectConflicts(localQuotes, remoteQuotes) {
  const localMap = new Map(localQuotes.map(q => [q.text.toLowerCase(), q]));
  const conflicts = [];

  for (const remote of remoteQuotes) {
    const key = remote.text.toLowerCase();
    if (localMap.has(key)) {
      const local = localMap.get(key);
      if (local.category !== remote.category) {
        conflicts.push({ local, remote });
      }
    }
  }

  return conflicts;
}

/**
 * Resolves conflicts using "server wins" strategy.
 * Also adds new remote quotes not present locally.
 */
function applyServerWins(localQuotes, remoteQuotes) {
  const localMap = new Map(localQuotes.map(q => [q.text.toLowerCase(), q]));
  const remoteMap = new Map(remoteQuotes.map(q => [q.text.toLowerCase(), q]));

  // Add or overwrite with remote data
  for (const [key, remote] of remoteMap) {
    localMap.set(key, remote);
  }

  return Array.from(localMap.values());
}

/**
 * Fetches quotes from server and syncs with conflict resolution.
 */
async function fetchQuotesFromServer() {
  if (isSyncing) return;
  isSyncing = true;
  showNotification('Syncing with server...', 'info');

  try {
    const res = await fetch(SERVER_URL);
    if (!res.ok) throw new Error('Network response was not ok');

    const posts = await res.json();
    const remoteQuotes = posts.map(transformPostToQuote);

    // Detect conflicts
    const conflicts = detectConflicts(quotes, remoteQuotes);

    if (conflicts.length > 0) {
      // Auto-resolve using "server wins" (as per requirement)
      quotes = applyServerWins(quotes, remoteQuotes);
      saveQuotes();
      populateCategories();
      showNotification(
        `Sync complete. ${conflicts.length} conflict(s) resolved (server wins).`,
        'success'
      );
    } else {
      // No conflicts: merge new quotes only
      const existing = new Set(quotes.map(q => q.text.toLowerCase()));
      const newQuotes = remoteQuotes.filter(q => !existing.has(q.text.toLowerCase()));
      if (newQuotes.length > 0) {
        quotes.push(...newQuotes);
        saveQuotes();
        populateCategories();
        showNotification(`Added ${newQuotes.length} new quotes from server.`, 'success');
      } else {
        showNotification('No new updates from server.', 'info');
      }
    }

    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());

  } catch (error) {
    console.error('Sync failed:', error);
    showNotification('Sync failed. Check your connection.', 'error');
  } finally {
    isSyncing = false;
  }
}

function syncWithServer() {
  fetchQuotesFromServer();
}

function startAutoSync() {
  if (syncIntervalId) clearInterval(syncIntervalId);
  syncIntervalId = setInterval(fetchQuotesFromServer, SYNC_INTERVAL);
}

// ==========================
// NOTIFICATIONS & INIT
// ==========================

function showNotification(message, type = 'success') {
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 12px 20px;
    background: ${type === 'error' ? '#f44336' : type === 'info' ? '#2196f3' : '#4caf50'};
    color: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    z-index: 10000; max-width: 320px; font-size: 14px;
    animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
  `;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// Inject notification CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
  @keyframes fadeOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }
`;
document.head.appendChild(style);

// ==========================
// INITIALIZATION
// ==========================

function initializeApp() {
  loadQuotes();
  populateCategories();

  // Restore filter
  const savedFilter = loadLastFilter();
  if (savedFilter !== 'all') {
    selectedCategory = savedFilter;
    document.getElementById('categoryFilter').value = savedFilter;
  }

  showRandomQuote();
  startAutoSync();

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
  document.getElementById('newQuoteCategory')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') addQuote();
  });
}

// Start app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
