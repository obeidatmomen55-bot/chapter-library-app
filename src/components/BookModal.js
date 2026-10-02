import { motion, AnimatePresence } from 'framer-motion';

function BookModal({ book, isOpen, onClose, isBorrowed, isSaved, onToggleBorrow, onToggleSave }) {
  if (!isOpen || !book) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ✕
            </button>

            <div className="modal-body">
              <div className="modal-cover-section">
                {book.thumbnail ? (
                  <img
                    src={book.thumbnail}
                    alt={`Cover of ${book.title}`}
                    className="modal-cover-image"
                  />
                ) : (
                  <div className={`modal-cover cover-${book.color}`}>
                    <span className="cover-label">CHAPTER LIBRARY</span>
                    <strong>
                      {book.cover.split('\n').map((line, i) => (
                        <span key={i}>{line}</span>
                      ))}
                    </strong>
                  </div>
                )}
              </div>

              <div className="modal-details">
                <span className="modal-genre">{book.genre}</span>
                <h2>{book.title}</h2>
                <p className="modal-author">by {book.author}</p>

                <div className="modal-meta">
                  <span className="modal-rating">★ {book.rating}</span>
                  {book.pageCount && (
                    <span className="modal-pages">{book.pageCount} pages</span>
                  )}
                  {book.publishedDate && (
                    <span className="modal-date">{book.publishedDate}</span>
                  )}
                </div>

                <p className="modal-description">
                  {book.description}
                </p>

                <div className="modal-actions">
                  <motion.button
                    className={isBorrowed ? 'borrow-button borrowed' : 'borrow-button'}
                    disabled={!book.available}
                    onClick={() => onToggleBorrow(book.id)}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isBorrowed
                      ? '✓ Borrowed'
                      : book.available
                        ? 'Borrow this book'
                        : 'Join waitlist'}
                  </motion.button>

                  <motion.button
                    className={isSaved ? 'save-btn is-saved' : 'save-btn'}
                    onClick={() => onToggleSave(book.id)}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSaved ? '♥ Saved' : '♡ Save for later'}
                  </motion.button>

                  {book.previewLink && (
                    <a
                      href={book.previewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="preview-link"
                    >
                      View on Open Library ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BookModal;
