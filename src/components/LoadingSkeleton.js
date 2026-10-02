import { motion } from 'framer-motion';

function LoadingSkeleton({ count = 8 }) {
  return (
    <div className="book-grid">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="skeleton-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
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
