import ThemeToggle from './ThemeToggle';

const categoryIcons = {
  'All books': '📚',
  'Fiction': '✨',
  'Mystery': '🔍',
  'Memoir': '✍️',
  'Personal Growth': '🌱',
  'Art & Design': '🎨',
  'Science': '🔬',
};

const categories = [
  'Fiction',
  'Mystery',
  'Memoir',
  'Personal Growth',
  'Art & Design',
  'Science',
];

function Sidebar({
  currentView,
  setCurrentView,
  activeCategory,
  setActiveCategory,
  borrowedCount,
  savedCount,
}) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#home" aria-label="Chapter home">
        <span className="brand-mark">c.</span>
        <span>
          chapter<span className="brand-dot">.</span>
        </span>
      </a>

      <div className="side-label">MENU</div>
      <nav className="main-nav" aria-label="Main navigation">
        <a
          className={`nav-link ${currentView === 'discover' ? 'active' : ''}`}
          href="#discover"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('discover');
          }}
        >
          <span className="nav-icon">⌕</span>
          Discover
        </a>
        <a
          className={`nav-link ${currentView === 'my-books' ? 'active' : ''}`}
          href="#catalog"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('my-books');
          }}
        >
          <span className="nav-icon">◤</span>
          My books
          <span className="nav-count">{borrowedCount}</span>
        </a>
        <a
          className={`nav-link ${currentView === 'saved' ? 'active' : ''}`}
          href="#saved"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('saved');
          }}
        >
          <span className="nav-icon">♡</span>
          Saved
          <span className="nav-count">{savedCount}</span>
        </a>
      </nav>

      <div className="side-label genres-label">BROWSE BY GENRE</div>
      <nav className="genre-nav" aria-label="Browse by genre">
        {categories.map((category) => (
          <button
            key={category}
            className={
              activeCategory === category
                ? 'genre-link selected'
                : 'genre-link'
            }
            onClick={() => setActiveCategory(category)}
          >
            <span
              className="genre-icon"
              style={{ marginRight: '8px', fontSize: '14px' }}
            >
              {categoryIcons[category]}
            </span>
            {category}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <ThemeToggle />
        <div className="help-section">
          <div className="help-icon">?</div>
          <div>
            <strong>Need a hand?</strong>
            <span>We're happy to help.</span>
          </div>
        </div>
        <a href="mailto:hello@chapter.library" aria-label="Email support">
          ↗
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
