import { motion } from 'framer-motion';

function SearchBar({ search, setSearch, onReset }) {
  return (
    <div className="catalog-tools">
      <motion.label
        className="search-box"
        whileFocusWithin={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <span>⌕</span>
        <input
          aria-label="Search books"
          placeholder="Search books..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <kbd>⌘ K</kbd>
      </motion.label>
      <button className="filter-button" onClick={onReset}>
        ↗<span> Reset</span>
      </button>
    </div>
  );
}

export default SearchBar;
