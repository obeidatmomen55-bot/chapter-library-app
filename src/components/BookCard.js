import { useState } from 'react';
import { motion } from 'framer-motion';

function BookCard({ book, isSaved, isBorrowed, onToggleSave, onToggleBorrow, onViewDetails, index }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const showRealImage = book.thumbnail && imageLoaded && !imageError;
  const showPlaceholder = !book.thumbnail || !imageLoaded || imageError;

  return (
    <motion.article
      className="book-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      layout
    >
      <motion.div
        className={`book-cover cover-${book.color}`}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => onViewDetails(book)}
        style={{ cursor: 'pointer' }}
      >
        {/* Always render the placeholder text underneath */}
        {showPlaceholder && (
          <>
            <span className="cover-label">CHAPTER LIBRARY</span>
            <strong>
              {book.cover.split('\n').map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </strong>
            <span className="cover-author">
              {book.author.toUpperCase()}
            </span>
          </>
        )}

        {/* Load image on top — hidden until loaded */}
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

        <motion.button
          className={isSaved ? 'save-button is-saved' : 'save-button'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(book.id);
          }}
          aria-label={
            isSaved
              ? `Remove ${book.title} from saved`
              : `Save ${book.title}`
          }
          whileTap={{ scale: 1.3 }}
        >
          {isSaved ? '♥' : '♡'}
        </motion.button>
      </motion.div>

      <div className="book-info">
        <div>
          <span className="book-genre">{book.genre}</span>
          <span className="book-rating">★ {book.rating}</span>
        </div>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <div className="book-card-bottom">
          <span
            className={
              book.available
                ? 'availability'
                : 'availability unavailable'
            }
          >
            <i />
            {book.available ? 'Available now' : 'On loan'}
          </span>
          <motion.button
            disabled={!book.available}
            className={
              isBorrowed
                ? 'borrow-button borrowed'
                : 'borrow-button'
            }
            onClick={() => onToggleBorrow(book.id)}
            whileTap={{ scale: 0.95 }}
          >
            {isBorrowed
              ? '✓ Borrowed'
              : book.available
                ? 'Borrow'
                : 'Join waitlist'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export default BookCard;
