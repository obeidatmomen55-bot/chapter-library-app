import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Check, BookOpen, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

function BookCard({
  book,
  isSaved,
  isBorrowed,
  onToggleSave,
  onToggleBorrow,
  onViewDetails,
  index,
  viewMode = 'grid'
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const showPlaceholder = !book.thumbnail || !imageLoaded || imageError;

  function handleBorrowClick(e) {
    e.stopPropagation();

    if (!isBorrowed && book.available) {
      // Trigger subtle celebratory confetti burst
      try {
        confetti({
          particleCount: 28,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#34d399', '#f59e0b', '#60a5fa', '#f472b6']
        });
      } catch (err) {
        // Fallback gracefully if canvas is blocked
      }
    }

    onToggleBorrow(book.id);
  }

  /* ── List View Rendering ── */
  if (viewMode === 'list') {
    return (
      <motion.article
        className="book-list-item"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: Math.min(index * 0.025, 0.3),
          ease: [0.16, 1, 0.3, 1],
        }}
        onClick={() => onViewDetails(book)}
      >
        <div className={`list-thumbnail cover-${book.color}`}>
          {book.thumbnail && !imageError ? (
            <img
              src={book.thumbnail}
              alt={`Cover of ${book.title}`}
              className="list-cover-img"
              loading="lazy"
            />
          ) : (
            <BookOpen size={18} className="list-icon-fallback" />
          )}
        </div>

        <div className="list-content">
          <div className="list-header-row">
            <span className="book-genre-badge">{book.genre}</span>
            <span className="book-rating-badge">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span>{book.rating}</span>
            </span>
          </div>
          <h3 className="list-title">{book.title}</h3>
          <p className="list-author">by {book.author}</p>
        </div>

        <div className="list-actions">
          <span className={`availability-tag ${book.available ? 'is-available' : 'is-loaned'}`}>
            <i className="status-dot" />
            {book.available ? 'Available' : 'On loan'}
          </span>

          <motion.button
            className={`save-btn-icon ${isSaved ? 'is-saved' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(book.id);
            }}
            whileTap={{ scale: 0.85 }}
            aria-label={isSaved ? 'Remove from saved' : 'Save book'}
          >
            <Heart size={16} className={isSaved ? 'fill-rose-500 text-rose-500' : ''} />
          </motion.button>

          <motion.button
            disabled={!book.available}
            className={`borrow-button ${isBorrowed ? 'borrowed' : ''}`}
            onClick={handleBorrowClick}
            whileTap={{ scale: 0.95 }}
          >
            {isBorrowed ? (
              <>
                <Check size={12} strokeWidth={3} />
                <span>Borrowed</span>
              </>
            ) : book.available ? (
              'Borrow'
            ) : (
              'Waitlist'
            )}
          </motion.button>
        </div>
      </motion.article>
    );
  }

  /* ── Grid View Rendering ── */
  return (
    <motion.article
      className="book-card"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.035, 0.35),
        ease: [0.16, 1, 0.3, 1],
      }}
      layout
    >
      <motion.div
        className={`book-cover cover-${book.color}`}
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        onClick={() => onViewDetails(book)}
        style={{ cursor: 'pointer' }}
      >
        {/* Rating Floating Ribbon */}
        <div className="cover-rating-pill">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span>{book.rating}</span>
        </div>

        {/* Embossed Typography Placeholder */}
        {showPlaceholder && (
          <div className="cover-placeholder-content">
            <span className="cover-label">CHAPTER EDITION</span>
            <strong className="cover-title-text">
              {book.cover.split('\n').map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </strong>
            <span className="cover-author">
              {book.author.toUpperCase()}
            </span>
          </div>
        )}

        {/* Real Cover Image */}
        {book.thumbnail && !imageError && (
          <img
            src={book.thumbnail}
            alt={`Cover of ${book.title}`}
            className={`cover-image ${imageLoaded ? 'cover-image-loaded' : 'cover-image-loading'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {/* Save Heart Action Button */}
        <motion.button
          className={`save-button ${isSaved ? 'is-saved' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(book.id);
          }}
          aria-label={isSaved ? `Remove ${book.title} from saved` : `Save ${book.title}`}
          whileTap={{ scale: 1.25 }}
          whileHover={{ scale: 1.1 }}
        >
          <Heart size={14} className={isSaved ? 'fill-rose-500 text-rose-500' : ''} />
        </motion.button>
      </motion.div>

      {/* Book Metadata & Info */}
      <div className="book-info">
        <div className="book-meta-top">
          <span className="book-genre-badge">{book.genre}</span>
          {book.publishedDate && (
            <span className="book-year">
              <Clock size={10} className="mr-1" />
              {book.publishedDate}
            </span>
          )}
        </div>

        <h3 className="book-title" title={book.title}>
          {book.title}
        </h3>

        <p className="book-author">by {book.author}</p>

        <div className="book-card-bottom">
          <span
            className={`availability ${book.available ? '' : 'unavailable'}`}
          >
            <i className="status-dot" />
            {book.available ? 'Available' : 'On loan'}
          </span>

          <motion.button
            disabled={!book.available}
            className={`borrow-button ${isBorrowed ? 'borrowed' : ''}`}
            onClick={handleBorrowClick}
            whileTap={{ scale: 0.95 }}
          >
            {isBorrowed ? (
              <>
                <Check size={11} strokeWidth={3} />
                <span>Borrowed</span>
              </>
            ) : book.available ? (
              'Borrow'
            ) : (
              'Waitlist'
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export default BookCard;
