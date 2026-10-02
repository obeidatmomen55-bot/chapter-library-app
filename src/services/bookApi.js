const BASE_URL = 'https://openlibrary.org/search.json';

const COVER_COLORS = [
  'blue', 'orange', 'green', 'cream', 'pink',
  'yellow', 'red', 'purple',
];

const GENRE_MAP = {
  'fiction': 'Fiction',
  'fantasy': 'Fiction',
  'romance': 'Fiction',
  'science fiction': 'Fiction',
  'thriller': 'Mystery',
  'mystery': 'Mystery',
  'crime': 'Mystery',
  'biography': 'Memoir',
  'memoir': 'Memoir',
  'self-help': 'Personal Growth',
  'psychology': 'Personal Growth',
  'business': 'Personal Growth',
  'art': 'Art & Design',
  'design': 'Art & Design',
  'science': 'Science',
  'technology': 'Science',
  'history': 'Science',
  'philosophy': 'Science',
};

function mapGenre(subjects) {
  if (!subjects || subjects.length === 0) return 'Fiction';

  for (const subject of subjects) {
    const lowerSubject = subject.toLowerCase();
    for (const [key, value] of Object.entries(GENRE_MAP)) {
      if (lowerSubject.includes(key)) {
        return value;
      }
    }
  }

  return 'Fiction';
}

function formatCoverText(title) {
  const words = title.split(' ');
  if (words.length <= 2) return title.toUpperCase();

  const lines = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > 12 && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }

  if (current) lines.push(current.trim());

  return lines.map((l) => l.toUpperCase()).join('\n');
}

function transformBook(item, index) {
  const title = item.title || 'Untitled';
  const author = item.author_name ? item.author_name.join(', ') : 'Unknown Author';
  
  // Use Open Library cover ID if available
  const thumbnail = item.cover_i 
    ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`
    : null;

  const rating = item.ratings_average
    ? item.ratings_average.toFixed(1)
    : (4.0 + Math.random() * 0.9).toFixed(1);

  return {
    id: item.key.replace('/works/', ''), // Open Library IDs look like /works/OL12345W
    title,
    author,
    genre: mapGenre(item.subject),
    color: COVER_COLORS[index % COVER_COLORS.length],
    cover: formatCoverText(title),
    available: Math.random() > 0.25,
    rating,
    thumbnail,
    description: `This is a classic edition of ${title} by ${author}. It offers profound insights and remains a beloved title in our collection. (Data provided by Open Library).`,
    pageCount: item.number_of_pages_median || null,
    publishedDate: item.first_publish_year || null,
    previewLink: `https://openlibrary.org${item.key}`,
    infoLink: `https://openlibrary.org${item.key}`,
    isbn: item.isbn ? item.isbn[0] : null,
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 2) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url);

    if (response.ok) {
      return response.json();
    }

    if (response.status === 429) {
      const delay = 1500 * (attempt + 1);
      console.warn(`Rate limited, retrying in ${delay}ms...`);
      await wait(delay);
      continue;
    }

    throw new Error(`API error: ${response.status}`);
  }

  throw new Error('Too many retries — rate limited');
}

export async function searchBooks(query, maxResults = 20) {
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&limit=${maxResults}&fields=key,title,author_name,cover_i,ratings_average,first_publish_year,subject,number_of_pages_median,isbn`;

  const data = await fetchWithRetry(url);

  if (!data.docs || data.docs.length === 0) {
    return [];
  }

  return data.docs.map((item, index) => transformBook(item, index));
}

/**
 * Fetch many books in small batches using Open Library API.
 */
export async function fetchManyBooks(onBatch) {
  const queries = [
    'subject:fiction',
    'subject:mystery',
    'subject:memoir',
    'subject:psychology',
    'subject:science',
    'subject:history',
    'subject:art',
    'subject:fantasy'
  ];

  const allBooks = [];
  const seenIds = new Set();
  let colorIndex = 0;

  // Open Library is faster and less strict, we can do batches of 2 easily
  const BATCH_SIZE = 2;

  for (let i = 0; i < queries.length; i += BATCH_SIZE) {
    const batch = queries.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((q) => searchBooks(q, 80))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const book of result.value) {
          if (!seenIds.has(book.id)) {
            seenIds.add(book.id);
            allBooks.push({
              ...book,
              color: COVER_COLORS[colorIndex % COVER_COLORS.length],
            });
            colorIndex++;
          }
        }
      }
    }

    // Push current results to UI immediately after each batch
    if (onBatch) {
      onBatch([...allBooks]);
    }

    // Small delay between batches
    if (i + BATCH_SIZE < queries.length) {
      await wait(500);
    }
  }

  return allBooks;
}

export async function getBookById(bookId) {
  // Not heavily used in this app structure, but implemented for completeness
  const url = `${BASE_URL}?q=${bookId}&limit=1`;
  const data = await fetchWithRetry(url);
  if (data.docs && data.docs.length > 0) {
    return transformBook(data.docs[0], 0);
  }
  return null;
}
