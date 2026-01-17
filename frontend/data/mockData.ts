// Aligned with DB schema

export interface Book {
  isbn: string;
  title: string;
  author: string;
  coverUrl: string;
  description?: string;
  // Optional metadata for quick views
  rating?: number;
  genre?: string;
}

export interface Video {
  id: string;
  platform: 'tiktok';
  url: string;
  transcript?: string;
}

export interface VideoBook {
  videoId: string;
  isbn: string;
  confidence: number;
}

export interface Library {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'library' | 'bookstore';
  city?: 'vancouver' | 'richmond' | 'burnaby';
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export type LocationKey = 'vancouver' | 'richmond' | 'burnaby';

// Mock books from BookTok
export const mockBooks: Book[] = [
  {
    isbn: '978-1649374042',
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1701980900i/61431922.jpg',
    description: 'A dragon rider academy fantasy romance.',
  },
  {
    isbn: '978-1501110368',
    title: 'It Ends with Us',
    author: 'Colleen Hoover',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1688011813i/27362503.jpg',
    description: 'A brave and heartbreaking novel about domestic abuse.',
  },
  {
    isbn: '978-1635575569',
    title: 'A Court of Thorns and Roses',
    author: 'Sarah J. Maas',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1620324329i/50659467.jpg',
    description: 'A fantasy retelling of Beauty and the Beast.',
  },
];

// Mock videos (TikToks that mentioned these books)
export const mockVideos: Video[] = [
  {
    id: 'v1',
    platform: 'tiktok',
    url: 'https://tiktok.com/@booktokfaves/video/1',
  },
  {
    id: 'v2',
    platform: 'tiktok',
    url: 'https://tiktok.com/@readwithme/video/2',
  },
];

// Video to book associations
export const mockVideoBooks: VideoBook[] = [
  { videoId: 'v1', isbn: '978-1649374042', confidence: 0.95 },
  { videoId: 'v1', isbn: '978-1635575569', confidence: 0.88 },
  { videoId: 'v2', isbn: '978-1501110368', confidence: 0.92 },
];

// Additional books for Collection (books user has read/owns)
export const mockCollectionBooks: Book[] = [
  {
    isbn: '978-0316769488',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg',
  },
  {
    isbn: '978-0061120084',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg',
  },
  {
    isbn: '978-0743273565',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg',
  },
];

// Default region (Vancouver)
export const defaultRegion: MapRegion = {
  latitude: 49.2827,
  longitude: -123.1207,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Mock libraries grouped by region (for nwHacks demo)
const vancouverLibraries: Library[] = [
  {
    id: '1',
    name: 'Vancouver Public Library',
    latitude: 49.2799,
    longitude: -123.1156,
    type: 'library',
    city: 'vancouver',
  },
  {
    id: '2',
    name: 'UBC Library',
    latitude: 49.2677,
    longitude: -123.2527,
    type: 'library',
    city: 'vancouver',
  },
  {
    id: '3',
    name: 'Indigo Books',
    latitude: 49.2838,
    longitude: -123.1187,
    type: 'bookstore',
    city: 'vancouver',
  },
  {
    id: '4',
    name: 'Pulpfiction Books',
    latitude: 49.2634,
    longitude: -123.1015,
    type: 'bookstore',
    city: 'vancouver',
  },
  {
    id: '5',
    name: 'Kitsilano Library',
    latitude: 49.2656,
    longitude: -123.1614,
    type: 'library',
    city: 'vancouver',
  },
];

const richmondLibraries: Library[] = [
  {
    id: 'r1',
    name: 'Richmond Public Library - Brighouse',
    latitude: 49.1666,
    longitude: -123.1336,
    type: 'library',
    city: 'richmond',
  },
  {
    id: 'r2',
    name: 'Ironwood Library',
    latitude: 49.1283,
    longitude: -123.1156,
    type: 'library',
    city: 'richmond',
  },
  {
    id: 'r3',
    name: 'Richmond Public Library - Cambie',
    latitude: 49.1649,
    longitude: -123.1127,
    type: 'library',
    city: 'richmond',
  },
  {
    id: 'r4',
    name: 'Black Bond Books',
    latitude: 49.1702,
    longitude: -123.1376,
    type: 'bookstore',
    city: 'richmond',
  },
];

const burnabyLibraries: Library[] = [
  {
    id: 'b1',
    name: 'Metrotown Library',
    latitude: 49.2276,
    longitude: -123.0025,
    type: 'library',
    city: 'burnaby',
  },
  {
    id: 'b2',
    name: 'Tommy Douglas Library',
    latitude: 49.2482,
    longitude: -123.0205,
    type: 'library',
    city: 'burnaby',
  },
  {
    id: 'b3',
    name: 'Cameron Branch',
    latitude: 49.2534,
    longitude: -122.8931,
    type: 'library',
    city: 'burnaby',
  },
  {
    id: 'b4',
    name: 'Chapters Burnaby',
    latitude: 49.2272,
    longitude: -123.0066,
    type: 'bookstore',
    city: 'burnaby',
  },
];

export const locationPresets: Record<
  LocationKey,
  { label: string; region: MapRegion; libraries: Library[] }
> = {
  vancouver: {
    label: 'Vancouver',
    region: defaultRegion,
    libraries: vancouverLibraries,
  },
  richmond: {
    label: 'Richmond',
    region: {
      latitude: 49.1666,
      longitude: -123.1336,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    },
    libraries: richmondLibraries,
  },
  burnaby: {
    label: 'Burnaby',
    region: {
      latitude: 49.2488,
      longitude: -122.9805,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    },
    libraries: burnabyLibraries,
  },
};

// Legacy export for screens that expect a simple list (defaults to Vancouver)
export const mockLibraries: Library[] = vancouverLibraries;

// Helper to get TikTok source for a book
export function getTikTokSource(isbn: string): string | null {
  const videoBook = mockVideoBooks.find((vb) => vb.isbn === isbn);
  if (!videoBook) return null;
  const video = mockVideos.find((v) => v.id === videoBook.videoId);
  return video?.url || null;
}
