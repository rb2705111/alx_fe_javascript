# Dynamic Quote Generator with Web Storage

## Project Overview
A fully-featured dynamic web application that generates and displays quotes with persistent storage, category filtering, and JSON import/export capabilities. All data persists across browser sessions using Web Storage APIs.

## Repository Structure
```
alx_fe_javascript/
└── dom-manipulation/
    ├── index.html
    ├── script.js
    └── README.md
```

## Features

### Core Functionality
1. **Random Quote Display**: Shows random quotes from the collection
2. **Category Filtering**: Filter quotes by category
3. **Dynamic Quote Addition**: Add new quotes with custom categories
4. **Real-time DOM Updates**: All changes reflect immediately without page reload

### Web Storage Integration ⭐ NEW
5. **Local Storage Persistence**: Quotes automatically saved and loaded across sessions
6. **Session Storage Tracking**: Tracks last viewed quote and view count per session
7. **JSON Export**: Download all quotes as a formatted JSON file
8. **JSON Import**: Upload and merge quotes from JSON files
9. **Storage Management**: Clear all data and reset to defaults

## Web Storage Implementation

### Local Storage Features

#### Automatic Saving
Every time a quote is added, the entire collection is automatically saved:
```javascript
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}
```

#### Automatic Loading
On app initialization, quotes are loaded from local storage:
```javascript
function loadQuotes() {
  const storedQuotes = localStorage.getItem(STORAGE_KEY);
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [...defaultQuotes];
    saveQuotes();
  }
}
```

#### Benefits
- **Persistent Data**: Quotes survive browser restarts
- **No Server Required**: Everything stored locally
- **Instant Access**: No loading delays
- **Privacy**: Data never leaves the browser

### Session Storage Features

#### Last Viewed Quote Tracking
Stores the most recently displayed quote:
```javascript
function saveLastViewedQuote(quote) {
  sessionStorage.setItem(SESSION_LAST_QUOTE_KEY, JSON.stringify(quote));
}
```

#### View Count Tracking
Counts how many quotes viewed in current session:
```javascript
let viewCount = parseInt(sessionStorage.getItem(SESSION_VIEW_COUNT_KEY) || '0');
viewCount++;
sessionStorage.setItem(SESSION_VIEW_COUNT_KEY, viewCount.toString());
```

#### Benefits
- **Session-Specific Data**: Resets when browser closes
- **Lightweight**: Only stores temporary session data
- **User Experience**: Can restore last viewed quote

## JSON Import/Export

### Export Functionality

#### Creating JSON File
```javascript
function exportToJsonFile() {
  const jsonString = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `quotes_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}
```

#### Features
- **Formatted JSON**: 2-space indentation for readability
- **Automatic Filename**: Includes current date
- **Blob API**: Creates downloadable file in browser
- **Memory Cleanup**: Revokes object URL after download

### Import Functionality

#### Reading JSON Files
```javascript
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    
    // Validation
    if (!Array.isArray(importedQuotes)) {
      throw new Error('Invalid format');
    }
    
    // Merge or replace logic
    const shouldReplace = confirm('Replace or merge?');
    
    if (shouldReplace) {
      quotes = validQuotes;
