import { motion } from 'framer-motion';
import { Search, X, RotateCcw, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

function SearchBar({
  search,
  setSearch,
  onReset,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="catalog-tools">
      {/* Search Input Box */}
      <motion.div
        className="search-box"
        whileFocusWithin={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Search size={16} className="search-icon" />

        <input
          aria-label="Search books by title, author, or genre"
          placeholder="Search 1,000+ titles, authors..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {search ? (
          <button
            className="clear-search-btn"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className="search-kbd">⌘ K</kbd>
        )}
      </motion.div>

      {/* Sort Selector */}
      <div className="sort-wrapper">
        <SlidersHorizontal size={14} className="sort-icon" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
          aria-label="Sort books"
        >
          <option value="featured">✨ Featured</option>
          <option value="rating">★ Highest Rating</option>
          <option value="title">A-Z Title</option>
          <option value="author">Author Name</option>
        </select>
      </div>

      {/* View Mode Switcher */}
      <div className="view-toggle-group">
        <button
          className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
          aria-label="Grid view"
          title="Grid view"
        >
          <LayoutGrid size={15} />
        </button>

        <button
          className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
          aria-label="List view"
          title="List view"
        >
          <List size={15} />
        </button>
      </div>

      {/* Reset Filter Button */}
      <button
        className="filter-button"
        onClick={onReset}
        title="Reset all filters"
      >
        <RotateCcw size={13} />
        <span>Reset</span>
      </button>
    </div>
  );
}

export default SearchBar;
