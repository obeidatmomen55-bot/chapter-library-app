import ThemeToggle from './ThemeToggle';
import {
  Compass,
  Bookmark,
  Heart,
  Sparkles,
  Search,
  Feather,
  Sprout,
  Palette,
  Atom,
  HelpCircle,
  ArrowUpRight,
  BookMarked
} from 'lucide-react';

const categoryIconComponents = {
  'Fiction': Sparkles,
  'Mystery': Search,
  'Memoir': Feather,
  'Personal Growth': Sprout,
  'Art & Design': Palette,
  'Science': Atom,
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
      {/* Brand Header */}
      <a className="brand" href="#home" aria-label="Chapter Home">
        <div className="brand-badge">
          <BookMarked size={16} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <span className="brand-title">
            chapter<span className="brand-dot">.</span>
          </span>
          <span className="brand-subtitle">CURATED LIBRARY</span>
        </div>
      </a>

      {/* Main Navigation */}
      <div className="side-label">EXPLORE</div>
      <nav className="main-nav" aria-label="Main navigation">
        <button
          className={`nav-link ${currentView === 'discover' ? 'active' : ''}`}
          onClick={() => {
            setCurrentView('discover');
            setActiveCategory('All books');
          }}
        >
          <Compass size={17} className="nav-icon" />
          <span>Discover</span>
        </button>

        <button
          className={`nav-link ${currentView === 'my-books' ? 'active' : ''}`}
          onClick={() => setCurrentView('my-books')}
        >
          <Bookmark size={17} className="nav-icon" />
          <span>My Shelf</span>
          {borrowedCount > 0 && (
            <span className="nav-count active-count">{borrowedCount}</span>
          )}
        </button>

        <button
          className={`nav-link ${currentView === 'saved' ? 'active' : ''}`}
          onClick={() => setCurrentView('saved')}
        >
          <Heart size={17} className="nav-icon" />
          <span>Saved</span>
          {savedCount > 0 && (
            <span className="nav-count">{savedCount}</span>
          )}
        </button>
      </nav>

      {/* Browse by Genre */}
      <div className="side-label genres-label">BROWSE GENRES</div>
      <nav className="genre-nav" aria-label="Browse by genre">
        {categories.map((category) => {
          const IconComponent = categoryIconComponents[category] || Sparkles;
          const isSelected = activeCategory === category && currentView === 'discover';

          return (
            <button
              key={category}
              className={`genre-link ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setCurrentView('discover');
                setActiveCategory(category);
              }}
            >
              <span className="genre-icon-pill">
                <IconComponent size={14} />
              </span>
              <span>{category}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-bottom">
        <ThemeToggle />

        <div className="help-section">
          <div className="help-icon">
            <HelpCircle size={15} />
          </div>
          <div>
            <strong>Need a hand?</strong>
            <span>Library concierge</span>
          </div>
        </div>

        <a
          href="mailto:hello@chapter.library"
          aria-label="Email support"
          className="help-link"
        >
          <ArrowUpRight size={15} />
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
