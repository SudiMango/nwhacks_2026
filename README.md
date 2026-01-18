## Inspiration

Book recommendations on TikTok and Instagram are easy to discover but hard to act on. We kept saving videos and never revisiting them, losing great book recommendations in endless feeds. This is why we decided to create Bookmarked. 

## What it does

Bookmarked lets you paste TikTok video link and automatically extracts all books mentioned, enriches them with real book data, and saves them to a clean, visual TBR. It also shows nearby libraries and bookstores where you can get each book. Additionally, it uses your reading data to suggest personalized books to you, which you might like reading.

## How we built it

### Turning a TikTok link into a TBR list

A user pastes a TikTok link, which we process with **yt-dlp** to extract the audio. The audio is sent to **ElevenLabs** for speech-to-text transcription. That transcript is then passed to the **Gemini API**, which extracts all mentioned book titles and authors in a structured format. Finally, we enrich each book using the **Google Books API** to retrieve ISBNs, cover images, and descriptions before saving everything to our database and displaying it in the app.

### Displaying book availability at nearby libraries

A user selects a book in the app, which triggers a location-based search. We then leverage the **OpenStreetMap Overpass API** to find nearby public libraries. For each identified library, we use **Playwright** to scrape the **Bibliocommons** website in a headless browser to get real-time book availability and branch information. Finally, this enriched availability data is displayed to the user on an interactive map within the app.

### Recommending new books to users

The system takes user context, such as favorite genres, recently read books, and natural language queries (e.g., "books like The Hobbit"), and builds a detailed prompt for the **Gemini API**. Gemini returns a structured JSON list of book titles and authors. We then enrich each suggestion using the **Google Books API** to fetch complete details, including ISBNs, cover images, and descriptions. Finally, the enriched book data is stored in our database and displayed to the user in the app.

## Challenges we ran into

One of our biggest challenges was providing fast, accurate library availability without access to official public library APIs. Most library systems do not expose open, real-time availability endpoints, which made direct integration impossible. Because of this, the library finding algorithm takes very long to finish, resulting in bad user experience. 

Implementing Google OAuth was unexpectedly difficult due to session handling issues between the frontend and backend. Session state was not persisting correctly after authentication, leading to repeated login failures. We spent over two hours debugging token storage, redirects, and cookie configuration, but the issue remained unresolved within the hackathon time constraints. To keep the project moving, we ultimately designed and implemented a custom authentication system from scratch, allowing users to sign in and persist sessions reliably without blocking core functionality.

## Accomplishments that we're proud of

### Turning short-form video into a usable TBR

We successfully transformed chaotic, unstructured BookTok content into a clean, actionable reading list that users can actually engage with, save, and revisit.

### Connecting book discovery to real-world access

We bridged the gap between online recommendations and physical availability by showing users where they can find books at nearby libraries, turning discovery into immediate action.

### Building meaningful book recommendations

We created a recommendation system that adapts to user preferences and natural language queries, helping users discover new books that align with their reading taste.

### Building a fully working product

Despite time constraints and technical challenges, we delivered a cohesive, end-to-end application where all core features work together reliably.

## What we learned

We learned how critical performance optimization is when chaining multiple external services together. Even small inefficiencies compound quickly, especially with audio processing, AI calls, and location-based searches. Through this, we gained hands-on experience optimizing request flow, reducing redundant work, and implementing caching to reuse results instead of recomputing them. These optimizations were essential to keeping response times reasonable and making the product feel usable within a real-world setting.

## What's next for Bookmarked

Next, we plan to expand support to Instagram Reels and enable direct link sharing into the app through the native share menu for a faster, more seamless workflow. We also want to establish deeper integrations with local library systems, allowing users to check availability, place holds, and interact with libraries directly rather than relying on scraped data.

