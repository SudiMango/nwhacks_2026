import { Book } from "./mockData";

export interface Comment {
    id: string;
    user: string;
    text: string;
    timeAgo: string;
}

export interface Post {
    id: string;
    user: string;
    avatarColor: string;
    createdAt: string;
    book: Book;
    rating: number;
    review: string;
    likes: number;
    comments: Comment[];
}

export const mockPosts: Post[] = [
    {
        id: "p1",
        user: "Maya Reads",
        avatarColor: "#FBBF24",
        createdAt: "2h ago",
        book: {
            isbn: "978-1649374042",
            title: "Fourth Wing",
            author: "Rebecca Yarros",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1701980900i/61431922.jpg",
            rating: 4.7,
            genre: "Fantasy",
        },
        rating: 4.8,
        review:
            "If you wanted dragon school + enemies to lovers + nonstop action, this absolutely delivers. The pacing never lets up and the banter is so sharp.",
        likes: 241,
        comments: [
            {
                id: "c1",
                user: "InkAndIcedCoffee",
                text: "The training montage had me hooked. Totally agree on the banter!",
                timeAgo: "1h ago",
            },
            {
                id: "c2",
                user: "Riley B",
                text: "I screamed at that chapter 27 twist 🤯",
                timeAgo: "42m ago",
            },
        ],
    },
    {
        id: "p2",
        user: "Alex 📚",
        avatarColor: "#60A5FA",
        createdAt: "6h ago",
        book: {
            isbn: "978-1501110368",
            title: "It Ends with Us",
            author: "Colleen Hoover",
            cover_url:
                "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1688011813i/27362503.jpg",
            rating: 4.6,
            genre: "Romance",
        },
        rating: 4.4,
        review:
            "Heartbreaking but hopeful. The way the story handles cycles of harm felt honest, and the letters are what pushed this to a 5-star feeling read.",
        likes: 198,
        comments: [
            {
                id: "c3",
                user: "PageTurner",
                text: "Those journals had me crying. Thanks for the content warning callout!",
                timeAgo: "5h ago",
            },
        ],
    },
    {
        id: "p3",
        user: "Jess from BookTok",
        avatarColor: "#A78BFA",
        createdAt: "1d ago",
        book: {
            isbn: "978-0593200127",
            title: "Beach Read",
            author: "Emily Henry",
            cover_url:
                "https://covers.openlibrary.org/b/isbn/9781984806734-L.jpg",
            rating: 4.2,
            genre: "Romance",
        },
        rating: 4.5,
        review:
            "Big feelings and bigger chemistry. Loved how it explores writing blocks and grief while still feeling like a summer rom-com.",
        likes: 154,
        comments: [],
    },
    {
        id: "p4",
        user: "Sam",
        avatarColor: "#34D399",
        createdAt: "2d ago",
        book: {
            isbn: "978-0062855312",
            title: "The Silent Patient",
            author: "Alex Michaelides",
            cover_url:
                "https://covers.openlibrary.org/b/isbn/9780062855312-L.jpg",
            rating: 4.1,
            genre: "Thriller",
        },
        rating: 4.1,
        review:
            "Short, tense, and that final reveal actually got me. I kept flipping pages to try to beat the twist and still lost.",
        likes: 117,
        comments: [
            {
                id: "c4",
                user: "NoSpoilers",
                text: "Same! I thought I had it figured out on page 120... nope.",
                timeAgo: "1d ago",
            },
            {
                id: "c5",
                user: "CozyThrillerFan",
                text: "Audiobook narrator was fantastic if anyone is on the fence.",
                timeAgo: "23h ago",
            },
        ],
    },
];
