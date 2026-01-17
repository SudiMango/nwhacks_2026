export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  tiktokSource: string;
}

export interface Library {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'library' | 'bookstore';
}

// Mock books from BookTok
export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1701980900i/61431922.jpg',
    tiktokSource: '@booktokfaves',
  },
  {
    id: '2',
    title: 'It Ends with Us',
    author: 'Colleen Hoover',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1688011813i/27362503.jpg',
    tiktokSource: '@readwithme',
  },
  {
    id: '3',
    title: 'A Court of Thorns and Roses',
    author: 'Sarah J. Maas',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1620324329i/50659467.jpg',
    tiktokSource: '@fantasyreads',
  },
];

// Mock libraries near Vancouver (for nwHacks demo)
export const mockLibraries: Library[] = [
  {
    id: '1',
    name: 'Vancouver Public Library',
    latitude: 49.2799,
    longitude: -123.1156,
    type: 'library',
  },
  {
    id: '2',
    name: 'UBC Library',
    latitude: 49.2677,
    longitude: -123.2527,
    type: 'library',
  },
  {
    id: '3',
    name: 'Indigo Books',
    latitude: 49.2838,
    longitude: -123.1187,
    type: 'bookstore',
  },
  {
    id: '4',
    name: 'Pulpfiction Books',
    latitude: 49.2634,
    longitude: -123.1015,
    type: 'bookstore',
  },
  {
    id: '5',
    name: 'Kitsilano Library',
    latitude: 49.2656,
    longitude: -123.1614,
    type: 'library',
  },
];

// Default region (Vancouver)
export const defaultRegion = {
  latitude: 49.2827,
  longitude: -123.1207,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};
