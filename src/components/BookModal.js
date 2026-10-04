import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  BookOpen,
  Calendar,
  ExternalLink,
  Check,
  Heart,
  Tag,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

function BookModal({
  book,
  isOpen,
  onClose,
  isBorrowed,
  isSaved,
  onToggleBorrow,
  onToggleSave
}) {
  if (!isOpen || !book) return null;

  function handleBorrowClick() {
    if (!isBorrowed && book.available) {
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#34d399', '#f59e0b', '#60a5fa', '#f472b6']
        });
      } catch (e) {
        // Safe fallback
      }
    }
    onToggleBorrow(book.id);
  }

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
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            <div className="modal-body">
              {/* Cover Column */}
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
                    <strong className="modal-fallback-title">
                      {book.cover.split('\n').map((line, i) => (
                        <span key={i}>{line}</span>
                      ))}
                    </strong>
                    <span className="cover-author">
                      {book.author.toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="modal-badge-row">
                  <span className={`availability-tag ${book.available ? 'is-available' : 'is-loaned'}`}>
                    <i className="status-dot" />
                    {book.available ? 'Available in Library' : 'Currently on Loan'}
                  </span>
                </div>
              </div>

              {/* Detail Info Column */}
              <div className="modal-details">
                <div className="modal-header-meta">
                  <span className="modal-genre">
                    <Tag size={12} className="mr-1 inline" />
                    {book.genre}
                  </span>
                  <div className="modal-rating">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span>{book.rating} / 5.0</span>
                  </div>
                </div>

                <h2 className="modal-title">{book.title}</h2>
                <p className="modal-author">by {book.author}</p>

                {/* Metadata Pills */}
                <div className="modal-meta-grid">
                  {book.pageCount && (
                    <div className="meta-pill">
                      <BookOpen size={13} className="text-emerald-500" />
                      <span>{book.pageCount} pages</span>
                    </div>
                  )}

                  {book.publishedDate && (
                    <div className="meta-pill">
                      <Calendar size={13} className="text-amber-500" />
                      <span>Published {book.publishedDate}</span>
                    </div>
                  )}

                  <div className="meta-pill">
                    <ShieldCheck size={13} className="text-blue-500" />
                    <span>Verified Edition</span>
                  </div>
                </div>

                {/* Synopsis / Description */}
                <div className="modal-synopsis">
                  <h4>SYNOPSIS</h4>
                  <p className="modal-description">
                    {book.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="modal-actions">
                  <motion.button
                    className={`borrow-button modal-borrow-btn ${isBorrowed ? 'borrowed' : ''}`}
                    disabled={!book.available}
                    onClick={handleBorrowClick}
                    whileTap={{ scale: 0.96 }}
                  >
                    {isBorrowed ? (
                      <>
                        <Check size={14} strokeWidth={3} />
                        <span>Borrowed to Your Shelf</span>
                      </>
                    ) : book.available ? (
                      <>
                        <BookOpen size={14} />
                        <span>Borrow Book</span>
                      </>
                    ) : (
                      'Join Waitlist'
                    )}
                  </motion.button>

                  <motion.button
                    className={`save-btn ${isSaved ? 'is-saved' : ''}`}
                    onClick={() => onToggleSave(book.id)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart size={14} className={isSaved ? 'fill-rose-500 text-rose-500' : ''} />
                    <span>{isSaved ? 'Saved in Collection' : 'Save for Later'}</span>
                  </motion.button>

                  {book.previewLink && (
                    <a
                      href={book.previewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="preview-link"
                    >
                      <span>View on Open Library</span>
                      <ExternalLink size={13} />
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
