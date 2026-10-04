import { motion } from 'framer-motion';

function LoadingSkeleton({ count = 8, viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="book-list-container">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            className="skeleton-list-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.04 }}
          >
            <div className="skeleton-thumb shimmer" />
            <div className="skeleton-list-info">
              <div className="skeleton-line skeleton-genre shimmer" />
              <div className="skeleton-line skeleton-title shimmer" style={{ width: '65%' }} />
              <div className="skeleton-line skeleton-author shimmer" style={{ width: '40%' }} />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="book-grid">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="skeleton-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.04 }}
        >
          <div className="skeleton-cover shimmer" />
          <div className="skeleton-info">
            <div className="skeleton-line skeleton-genre shimmer" />
            <div className="skeleton-line skeleton-title shimmer" />
            <div className="skeleton-line skeleton-author shimmer" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
