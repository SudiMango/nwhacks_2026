// Aligned with DB schema

export interface Book {
  isbn: string;
  title: string;
  author: string;
  coverUrl: string;
  description?: string;
  book_id?: string;
  bookId?: string;
  tbr?: boolean;
  // Optional metadata for quick views
  rating?: number;
  genre?: string;
}

export interface Video {
    id: string;
    platform: "tiktok";
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
    type: "library" | "bookstore";
    city?: "vancouver" | "richmond" | "burnaby";
}

export interface MapRegion {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export type LocationKey = "vancouver" | "richmond" | "burnaby";

// Mock books from BookTok
export const mockBooks: Book[] = [
    {
        isbn: "978-1649374042",
        title: "Fourth Wing",
        author: "Rebecca Yarros",
        cover_url:
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1701980900i/61431922.jpg",
        description: "A dragon rider academy fantasy romance.",
        rating: 4.7,
        genre: "Fantasy",
    },
    {
        isbn: "978-1501110368",
        title: "It Ends with Us",
        author: "Colleen Hoover",
        cover_url:
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1688011813i/27362503.jpg",
        description: "A brave and heartbreaking novel about domestic abuse.",
        rating: 4.6,
        genre: "Romance",
    },
    {
        isbn: "978-1635575569",
        title: "A Court of Thorns and Roses",
        author: "Sarah J. Maas",
        cover_url:
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1620324329i/50659467.jpg",
        description: "A fantasy retelling of Beauty and the Beast.",
        rating: 4.5,
        genre: "Fantasy",
    },
];

// Mock videos (TikToks that mentioned these books)
export const mockVideos: Video[] = [
    {
        id: "v1",
        platform: "tiktok",
        url: "https://tiktok.com/@booktokfaves/video/1",
    },
    {
        id: "v2",
        platform: "tiktok",
        url: "https://tiktok.com/@readwithme/video/2",
    },
];

// Video to book associations
export const mockVideoBooks: VideoBook[] = [
    { videoId: "v1", isbn: "978-1649374042", confidence: 0.95 },
    { videoId: "v1", isbn: "978-1635575569", confidence: 0.88 },
    { videoId: "v2", isbn: "978-1501110368", confidence: 0.92 },
];

// Additional books for Collection (books user has read/owns)
export const mockCollectionBooks: Book[] = [
    {
        isbn: "978-0316769488",
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        cover_url:
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg",
        genre: "Classics",
        rating: 4.1,
    },
    {
        isbn: "978-0061120084",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        cover_url:
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
        genre: "Classics",
        rating: 4.8,
    },
    {
        isbn: "978-0743273565",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        cover_url:
            "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg",
        genre: "Classics",
        rating: 4.2,
    },
];

// Recommended picks by genre (top 5 per genre for quick actions)
export const recommendedByGenre: Record<string, Book[]> = {
    fantasy: [
        {
            isbn: "978-1526637882",
            title: "The Priory of the Orange Tree",
            author: "Samantha Shannon",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1547001035i/29774026.jpg",
            description:
                "Epic standalone with dragons and matriarchal kingdoms.",
            rating: 4.6,
            genre: "Fantasy",
        },
        {
            isbn: "978-0553573404",
            title: "A Game of Thrones",
            author: "George R.R. Martin",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1562726234i/13496.jpg",
            description: "Gritty politics, direwolves, and looming winter.",
            rating: 4.7,
            genre: "Fantasy",
        },
        {
            isbn: "978-0316341684",
            title: "Ninth House",
            author: "Leigh Bardugo",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1549474844i/43263680.jpg",
            description: "Secret societies at Yale with a dark magic twist.",
            rating: 4.3,
            genre: "Fantasy",
        },
        {
            isbn: "978-0062316110",
            title: "The Fifth Season",
            author: "N.K. Jemisin",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1481846683i/19161852.jpg",
            description:
                "Apocalyptic earthshakers fight to survive a broken world.",
            rating: 4.6,
            genre: "Fantasy",
        },
        {
            isbn: "978-0593189606",
            title: "Legendborn",
            author: "Tracy Deonn",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1578430403i/50892338.jpg",
            description:
                "Arthurian magic collides with contemporary campus life.",
            rating: 4.6,
            genre: "Fantasy",
        },
    ],
    romance: [
        {
            isbn: "978-0349437002",
            title: "Happy Place",
            author: "Emily Henry",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1662508660i/61718053.jpg",
            description: "Exes fake it for friends during one last beach week.",
            rating: 4.2,
            genre: "Romance",
        },
        {
            isbn: "978-1982187665",
            title: "Icebreaker",
            author: "Hannah Grace",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1664987960i/61884986.jpg",
            description: "Hockey x figure skating rivals-to-lovers spice.",
            rating: 4.1,
            genre: "Romance",
        },
        {
            isbn: "978-0593334839",
            title: "The Love Hypothesis",
            author: "Ali Hazelwood",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1611927247i/56732449.jpg",
            description: "STEM fake-dating with big banter and bigger hearts.",
            rating: 4.3,
            genre: "Romance",
        },
        {
            isbn: "978-1734574160",
            title: "The Spanish Love Deception",
            author: "Elena Armas",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1604691952i/54189398.jpg",
            description: "Sun-drenched fake date to a family wedding in Spain.",
            rating: 4.0,
            genre: "Romance",
        },
        {
            isbn: "978-0593200127",
            title: "Beach Read",
            author: "Emily Henry",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1566742514i/52867387.jpg",
            description: "Authors swap genres and sparks fly by the lake.",
            rating: 4.2,
            genre: "Romance",
        },
    ],
    thriller: [
        {
            isbn: "978-0062855312",
            title: "The Silent Patient",
            author: "Alex Michaelides",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1526543865i/40097951.jpg",
            description: "A painter stops speaking after a shocking crime.",
            rating: 4.1,
            genre: "Thriller",
        },
        {
            isbn: "978-0385547964",
            title: "The Maid",
            author: "Nita Prose",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1638348721i/58065735.jpg",
            description: "A hotel maid finds herself tangled in a murder case.",
            rating: 4.0,
            genre: "Thriller",
        },
        {
            isbn: "978-1250082252",
            title: "The Woman in the Window",
            author: "A.J. Finn",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1509028521i/40389527.jpg",
            description: "An agoraphobic woman witnesses something impossible.",
            rating: 3.9,
            genre: "Thriller",
        },
        {
            isbn: "978-1250301704",
            title: "The Guest List",
            author: "Lucy Foley",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579704915i/53321687.jpg",
            description: "A luxe island wedding goes deadly in the dark.",
            rating: 4.0,
            genre: "Thriller",
        },
        {
            isbn: "978-0062913463",
            title: "Verity",
            author: "Colleen Hoover",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1533004302i/41957126.jpg",
            description: "A ghostwriter uncovers chilling secrets in an attic.",
            rating: 4.3,
            genre: "Thriller",
        },
    ],
};

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
        id: "1",
        name: "Vancouver Public Library",
        latitude: 49.2799,
        longitude: -123.1156,
        type: "library",
        city: "vancouver",
    },
    {
        id: "2",
        name: "UBC Library",
        latitude: 49.2677,
        longitude: -123.2527,
        type: "library",
        city: "vancouver",
    },
    {
        id: "3",
        name: "Indigo Books",
        latitude: 49.2838,
        longitude: -123.1187,
        type: "bookstore",
        city: "vancouver",
    },
    {
        id: "4",
        name: "Pulpfiction Books",
        latitude: 49.2634,
        longitude: -123.1015,
        type: "bookstore",
        city: "vancouver",
    },
    {
        id: "5",
        name: "Kitsilano Library",
        latitude: 49.2656,
        longitude: -123.1614,
        type: "library",
        city: "vancouver",
    },
];

const richmondLibraries: Library[] = [
    {
        id: "r1",
        name: "Richmond Public Library - Brighouse",
        latitude: 49.1666,
        longitude: -123.1336,
        type: "library",
        city: "richmond",
    },
    {
        id: "r2",
        name: "Ironwood Library",
        latitude: 49.1283,
        longitude: -123.1156,
        type: "library",
        city: "richmond",
    },
    {
        id: "r3",
        name: "Richmond Public Library - Cambie",
        latitude: 49.1649,
        longitude: -123.1127,
        type: "library",
        city: "richmond",
    },
    {
        id: "r4",
        name: "Black Bond Books",
        latitude: 49.1702,
        longitude: -123.1376,
        type: "bookstore",
        city: "richmond",
    },
];

const burnabyLibraries: Library[] = [
    {
        id: "b1",
        name: "Metrotown Library",
        latitude: 49.2276,
        longitude: -123.0025,
        type: "library",
        city: "burnaby",
    },
    {
        id: "b2",
        name: "Tommy Douglas Library",
        latitude: 49.2482,
        longitude: -123.0205,
        type: "library",
        city: "burnaby",
    },
    {
        id: "b3",
        name: "Cameron Branch",
        latitude: 49.2534,
        longitude: -122.8931,
        type: "library",
        city: "burnaby",
    },
    {
        id: "b4",
        name: "Chapters Burnaby",
        latitude: 49.2272,
        longitude: -123.0066,
        type: "bookstore",
        city: "burnaby",
    },
];

export const locationPresets: Record<
    LocationKey,
    { label: string; region: MapRegion; libraries: Library[] }
> = {
    vancouver: {
        label: "Vancouver",
        region: defaultRegion,
        libraries: vancouverLibraries,
    },
    richmond: {
        label: "Richmond",
        region: {
            latitude: 49.1666,
            longitude: -123.1336,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
        },
        libraries: richmondLibraries,
    },
    burnaby: {
        label: "Burnaby",
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
