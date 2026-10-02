import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

import { ThemeProvider } from './context/ThemeContext';
import { fetchManyBooks, searchBooks } from './services/bookApi';

import Sidebar from './components/Sidebar';
import BookCard from './components/BookCard';
import BookModal from './components/BookModal';
import SearchBar from './components/SearchBar';
import LoadingSkeleton from './components/LoadingSkeleton';

import './App.css';

const categories = [
  'All books',
  'Fiction',
  'Mystery',
  'Memoir',
  'Personal Growth',
  'Art & Design',
  'Science',
];

const categoryIcons = {
  'All books': '📚',
  'Fiction': '✨',
  'Mystery': '🔍',
  'Memoir': '✍️',
  'Personal Growth': '🌱',
  'Art & Design': '🎨',
  'Science': '🔬',
};

function AppContent() {
  const [activeCategory, setActiveCategory] = useState('All books');
  const [search, setSearch] = useState('');
  const [borrowed, setBorrowed] = useState(() => {
    const saved = localStorage.getItem('chapter-borrowed');
    return saved ? JSON.parse(saved) : [];
  });
  const [saved, setSaved] = useState(() => {
    const data = localStorage.getItem('chapter-saved');
    return data ? JSON.parse(data) : [];
  });
  const [currentView, setCurrentView] = useState('discover');
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // Persist borrowed/saved to localStorage
  useEffect(() => {
    localStorage.setItem('chapter-borrowed', JSON.stringify(borrowed));
  }, [borrowed]);

  useEffect(() => {
    localStorage.setItem('chapter-saved', JSON.stringify(saved));
  }, [saved]);

  // Fetch all books on mount — streams results as each batch arrives
  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      setLoading(true);
      setError(null);

      try {
        const results = await fetchManyBooks((booksSnapshot) => {
          // Update state with each batch so books appear immediately
          if (!cancelled) {
            setAllBooks(booksSnapshot);
            setLoading(false);
          }
        });

        if (!cancelled) {
          setAllBooks(results);
          setLoading(false);

          if (results.length === 0) {
            setError('No books found — the API may be temporarily unavailable.');
          }
        }
      } catch (err) {
        console.error('Failed to load books:', err);
        if (!cancelled) {
          setError('Could not load books. Please refresh the page.');
          setLoading(false);
        }
      }
    }

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced API search — searches on top of the loaded library
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchBooks(searchQuery, 40);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // The books to display — either search results or the full library
  const books = searchResults || allBooks;

  const visibleBooks = useMemo(() => {
    let filtered = books;

    if (currentView === 'my-books') {
      // For "my books" and "saved", always search across ALL loaded books
      filtered = allBooks.filter((book) => borrowed.includes(book.id));
    } else if (currentView === 'saved') {
      filtered = allBooks.filter((book) => saved.includes(book.id));
    }

    return filtered.filter((book) => {
      const matchesCategory =
        activeCategory === 'All books' || book.genre === activeCategory;
      const searchText =
        `${book.title} ${book.author} ${book.genre}`.toLowerCase();
      const matchesSearch = searchText.includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, currentView, borrowed, saved, books, allBooks]);

  function toggleBook(id) {
    setBorrowed((current) => {
      if (current.includes(id)) {
        toast('Book returned!', { icon: '📖' });
        return current.filter((bookId) => bookId !== id);
      }
      toast.success('Book borrowed!', { icon: '📚' });
      return [...current, id];
    });
  }

  function toggleSaved(id) {
    setSaved((current) => {
      if (current.includes(id)) {
        toast('Removed from saved', { icon: '💔' });
        return current.filter((bookId) => bookId !== id);
      }
      toast('Saved for later!', { icon: '♥' });
      return [...current, id];
    });
  }

  function resetFilters() {
    setSearch('');
    setSearchQuery('');
    setSearchResults(null);
    setActiveCategory('All books');
    setCurrentView('discover');
  }

  function handleSearchInput(value) {
    setSearch(value);
    setSearchQuery(value);
  }

  return (
    <div className="library-app">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 2000,
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            fontSize: '13px',
          },
        }}
      />

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        borrowedCount={borrowed.length}
        savedCount={saved.length}
      />

      <main className="main-content" id="home">
        <header className="topbar">
          <div className="breadcrumb">
            Your library <span>/</span>{' '}
            <strong>
              {currentView === 'my-books'
                ? 'My books'
                : currentView === 'saved'
                  ? 'Saved'
                  : 'Discover'}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="open-status">
              <i /> Open today until 8 pm
            </span>
            {isSearching && (
              <span className="searching-indicator">Searching API...</span>
            )}
            {!loading && (
              <span className="book-count-badge">
                {allBooks.length} books loaded
              </span>
            )}
            <button className="avatar" aria-label="Your profile">
              M
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {currentView === 'discover' && (
            <motion.section
              className="welcome"
              id="discover"
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="welcome-copy">
                <div className="eyebrow">
                  <span /> YOUR NEXT CHAPTER STARTS HERE
                </div>
                <h1>
                  A little more
                  <br />
                  <em>you</em> time.
                </h1>
                <p>
                  {loading
                    ? 'Loading hundreds of books from the library...'
                    : `${allBooks.length} books ready. Good stories, fresh perspectives, and a quiet place to find them.`}
                </p>
                <a
                  className="welcome-link"
                  href="#catalog"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('my-books');
                  }}
                >
                  Find your next read <span>↗</span>
                </a>
              </div>

              <div
                className="hero-art"
                aria-label="A stack of books and a cup of coffee"
              >
                <div className="sun-shape" />
                <div className="plant plant-one">✳</div>
                <div className="plant plant-two">✳</div>
                <div className="hero-book hero-book-back">
                  THE ART
                  <br />
                  OF SLOW
                  <br />
                  LIVING
                </div>
                <div className="hero-book hero-book-front">
                  <span>the</span>
                  <strong>
                    GREAT
                    <br />
                    perhaps
                  </strong>
                  <small>A NOVEL</small>
                </div>
                <div className="coffee">
                  <i />
                </div>
                <div className="hero-sparkle">✳</div>
              </div>

              <div className="hero-note">
                <span>✳</span> A good book is
                <br />
                always a good idea.
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="catalog" id="catalog">
          <div className="section-heading">
            <div>
              <div className="eyebrow small-eyebrow">
                {currentView === 'my-books'
                  ? 'YOUR SHELF'
                  : currentView === 'saved'
                    ? 'FOR LATER'
                    : 'PICK UP WHERE YOU LEFT OFF'}
              </div>
              <h2>
                {currentView === 'my-books'
                  ? 'My books'
                  : currentView === 'saved'
                    ? 'Saved books'
                    : 'Find your next read'}
                <span>.</span>
              </h2>
              <p>
                {currentView === 'my-books'
                  ? 'Books you are currently reading.'
                  : currentView === 'saved'
                    ? 'Titles you want to read later.'
                    : `Showing ${visibleBooks.length} of ${books.length} books from Google Books.`}
              </p>
            </div>

            <SearchBar
              search={search}
              setSearch={handleSearchInput}
              onReset={resetFilters}
            />
          </div>

          <div
            className="category-tabs"
            role="tablist"
            aria-label="Filter books by category"
          >
            {categories.map((category) => (
              <button
                key={category}
                role="tab"
                aria-selected={activeCategory === category}
                className={
                  activeCategory === category
                    ? 'category-tab active-tab'
                    : 'category-tab'
                }
                onClick={() => setActiveCategory(category)}
              >
                <span style={{ marginRight: '6px', fontSize: '12px' }}>
                  {categoryIcons[category]}
                </span>
                {category}
              </button>
            ))}
          </div>

          {error && (
            <motion.div
              className="api-notice"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          {loading ? (
            <LoadingSkeleton count={12} />
          ) : (
            <motion.div className="book-grid" layout>
              <AnimatePresence mode="popLayout">
                {visibleBooks.map((book, index) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={index}
                    isSaved={saved.includes(book.id)}
                    isBorrowed={borrowed.includes(book.id)}
                    onToggleSave={toggleSaved}
                    onToggleBorrow={toggleBook}
                    onViewDetails={setSelectedBook}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && visibleBooks.length === 0 && (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span>⌕</span>
              <h3>No books found</h3>
              <p>Try another title or browse all books.</p>
              <button onClick={resetFilters}>Show all books</button>
            </motion.div>
          )}

          <div className="catalog-footer">
            <span>
              Showing {visibleBooks.length} of {books.length} books
            </span>
            <a href="#catalog" onClick={resetFilters}>
              View all books <span>→</span>
            </a>
          </div>
        </section>

        <footer className="page-footer">
          <span>Made for the love of a good story.</span>
          <span>YOUR NEIGHBORHOOD LIBRARY · EST. 1987</span>
        </footer>
      </main>

      <BookModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        isBorrowed={selectedBook ? borrowed.includes(selectedBook.id) : false}
        isSaved={selectedBook ? saved.includes(selectedBook.id) : false}
        onToggleBorrow={toggleBook}
        onToggleSave={toggleSaved}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
