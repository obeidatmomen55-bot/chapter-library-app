import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Sparkles,
  BookOpen,
  Bookmark,
  Heart,
  Search,
  Feather,
  Sprout,
  Palette,
  Atom,
  Shuffle,
  Layers,
  ArrowRight
} from 'lucide-react';

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
  'All books': Layers,
  'Fiction': Sparkles,
  'Mystery': Search,
  'Memoir': Feather,
  'Personal Growth': Sprout,
  'Art & Design': Palette,
  'Science': Atom,
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

  // View mode (grid or list)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('chapter-view-mode') || 'grid';
  });

  // Sort order
  const [sortBy, setSortBy] = useState('featured');

  // Persist borrowed, saved & view mode to localStorage
  useEffect(() => {
    localStorage.setItem('chapter-borrowed', JSON.stringify(borrowed));
  }, [borrowed]);

  useEffect(() => {
    localStorage.setItem('chapter-saved', JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    localStorage.setItem('chapter-view-mode', viewMode);
  }, [viewMode]);

  // Global keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const inputEl = document.querySelector('.search-box input');
        if (inputEl) {
          inputEl.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch all books on mount with streaming batches
  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      setLoading(true);
      setError(null);

      try {
        const results = await fetchManyBooks((booksSnapshot) => {
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

  // Debounced API search
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
    }, 550);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // The pool of books to display
  const baseBooks = searchResults || allBooks;

  // Filtered and Sorted books memo
  const visibleBooks = useMemo(() => {
    let filtered = baseBooks;

    if (currentView === 'my-books') {
      filtered = allBooks.filter((book) => borrowed.includes(book.id));
    } else if (currentView === 'saved') {
      filtered = allBooks.filter((book) => saved.includes(book.id));
    }

    // Category & search filter
    filtered = filtered.filter((book) => {
      const matchesCategory =
        activeCategory === 'All books' || book.genre === activeCategory;
      const searchText =
        `${book.title} ${book.author} ${book.genre}`.toLowerCase();
      const matchesSearch = searchText.includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    // Sorting
    const sorted = [...filtered];
    if (sortBy === 'rating') {
      sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'author') {
      sorted.sort((a, b) => a.author.localeCompare(b.author));
    }

    return sorted;
  }, [activeCategory, search, currentView, borrowed, saved, baseBooks, allBooks, sortBy]);

  function toggleBook(id) {
    setBorrowed((current) => {
      if (current.includes(id)) {
        toast('Book returned to library', { icon: '📖' });
        return current.filter((bookId) => bookId !== id);
      }
      toast.success('Book added to your shelf!', { icon: '✨' });
      return [...current, id];
    });
  }

  function toggleSaved(id) {
    setSaved((current) => {
      if (current.includes(id)) {
        toast('Removed from saved titles', { icon: '🖤' });
        return current.filter((bookId) => bookId !== id);
      }
      toast.success('Saved to your collection', { icon: '💖' });
      return [...current, id];
    });
  }

  function resetFilters() {
    setSearch('');
    setSearchQuery('');
    setSearchResults(null);
    setActiveCategory('All books');
    setCurrentView('discover');
    setSortBy('featured');
  }

  function handleSearchInput(value) {
    setSearch(value);
    setSearchQuery(value);
  }

  // Surprise pick handler
  function handleSurpriseMe() {
    if (allBooks.length === 0) return;
    const randomBook = allBooks[Math.floor(Math.random() * allBooks.length)];
    setSelectedBook(randomBook);
    toast('Curator picked a surprise read for you!', { icon: '🎲' });
  }

  return (
    <div className="library-app">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 2500,
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: 'var(--shadow-lg)'
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
        {/* Topbar */}
        <header className="topbar">
          <div className="breadcrumb">
            <span className="breadcrumb-root">Chapter</span>
            <span className="breadcrumb-divider">/</span>
            <strong className="breadcrumb-current">
              {currentView === 'my-books'
                ? 'My Shelf'
                : currentView === 'saved'
                  ? 'Saved Collection'
                  : 'Discover Library'}
            </strong>
          </div>

          <div className="topbar-right">
            {/* Quick Stats Pill */}
            <div className="reading-stats-pill">
              <span className="stat-item" title="Active loans">
                <Bookmark size={13} className="text-emerald-500" />
                <strong>{borrowed.length}</strong> on shelf
              </span>
              <span className="stat-separator">•</span>
              <span className="stat-item" title="Saved for later">
                <Heart size={13} className="text-rose-500" />
                <strong>{saved.length}</strong> saved
              </span>
            </div>

            {isSearching && (
              <span className="searching-indicator">
                <span className="spinner-dot" />
                Searching...
              </span>
            )}

            {!loading && (
              <span className="book-count-badge">
                <Layers size={12} />
                <span>{allBooks.length} books</span>
              </span>
            )}

            {/* Profile Avatar */}
            <div className="user-profile-btn" title="Your Reading Profile">
              <span className="user-avatar-initial">M</span>
              <span className="online-indicator-dot" />
            </div>
          </div>
        </header>

        {/* Hero Banner (Discover View) */}
        <AnimatePresence mode="wait">
          {currentView === 'discover' && !search && (
            <motion.section
              className="welcome"
              id="discover"
              key="welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <div className="welcome-copy">
                <div className="eyebrow">
                  <Sparkles size={13} className="eyebrow-sparkle" />
                  <span>CURATED EDITION · AUTUMN 2026</span>
                </div>

                <h1>
                  A little more
                  <br />
                  <em>you</em> time.
                </h1>

                <p>
                  {loading
                    ? 'Connecting to Open Library collection...'
                    : `Over ${allBooks.length} curated works of literature, thought, and discovery ready for your shelf.`}
                </p>

                <div className="hero-cta-group">
                  <a
                    className="welcome-link primary-cta"
                    href="#catalog"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory('Fiction');
                    }}
                  >
                    <span>Explore Bestsellers</span>
                    <ArrowRight size={14} />
                  </a>

                  <button
                    className="welcome-link surprise-cta"
                    onClick={handleSurpriseMe}
                  >
                    <Shuffle size={14} />
                    <span>Surprise Me</span>
                  </button>
                </div>
              </div>

              {/* Floating Book Art Graphic */}
              <div
                className="hero-art"
                aria-label="Artistic stack of books"
              >
                <div className="sun-shape" />
                <div className="plant plant-one">✳</div>
                <div className="plant plant-two">✳</div>

                <div className="hero-book hero-book-back">
                  <div className="hero-book-spine" />
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
                <div className="hero-sparkle">✦</div>
              </div>

              <div className="hero-note">
                <span>✦</span> A good book is always a good idea.
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Catalog Section */}
        <section className="catalog" id="catalog">
          <div className="section-heading">
            <div>
              <div className="eyebrow small-eyebrow">
                {currentView === 'my-books'
                  ? 'YOUR ACTIVE SHELF'
                  : currentView === 'saved'
                    ? 'BOOKMARKED FOR LATER'
                    : 'EXPLORE TITLES'}
              </div>

              <h2>
                {currentView === 'my-books'
                  ? 'My Books Shelf'
                  : currentView === 'saved'
                    ? 'Saved Reading List'
                    : 'Find your next read'}
                <span className="accent-dot">.</span>
              </h2>

              <p>
                {currentView === 'my-books'
                  ? `You have borrowed ${borrowed.length} title${borrowed.length === 1 ? '' : 's'} on loan.`
                  : currentView === 'saved'
                    ? `You have saved ${saved.length} title${saved.length === 1 ? '' : 's'} for later.`
                    : `Displaying ${visibleBooks.length} titles from global collection.`}
              </p>
            </div>

            <SearchBar
              search={search}
              setSearch={handleSearchInput}
              onReset={resetFilters}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

          {/* Category Tabs */}
          <div
            className="category-tabs"
            role="tablist"
            aria-label="Filter books by category"
          >
            {categories.map((category) => {
              const IconComp = categoryIcons[category] || Sparkles;
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={isActive}
                  className={`category-tab ${isActive ? 'active-tab' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  <IconComp size={14} className="tab-icon" />
                  <span>{category}</span>
                </button>
              );
            })}
          </div>

          {/* Error Notice */}
          {error && (
            <motion.div
              className="api-notice"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Book Cards Grid / List */}
          {loading ? (
            <LoadingSkeleton count={viewMode === 'grid' ? 12 : 6} viewMode={viewMode} />
          ) : (
            <motion.div
              className={viewMode === 'grid' ? 'book-grid' : 'book-list-container'}
              layout
            >
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
                    viewMode={viewMode}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && visibleBooks.length === 0 && (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="empty-state-icon">
                <BookOpen size={32} />
              </div>
              <h3>No books matching your criteria</h3>
              <p>Try searching for a different author, title, or clear active filters.</p>
              <button className="empty-reset-btn" onClick={resetFilters}>
                Browse All Books
              </button>
            </motion.div>
          )}

          {/* Catalog Footer */}
          <div className="catalog-footer">
            <span>
              Showing {visibleBooks.length} of {allBooks.length} total books
            </span>
            <a href="#catalog" onClick={resetFilters} className="footer-view-all">
              <span>View All Collection</span>
              <ArrowRight size={12} />
            </a>
          </div>
        </section>

        {/* Page Footer */}
        <footer className="page-footer">
          <div className="footer-left">
            <span>Made with craft for the love of stories.</span>
            <span className="footer-tagline">CHAPTER EDITION · DIGITAL SANCTUARY</span>
          </div>
          <div className="footer-right">
            <span>Powered by Open Library API</span>
          </div>
        </footer>
      </main>

      {/* Book Detail Modal */}
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
