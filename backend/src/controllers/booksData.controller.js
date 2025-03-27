import axios from "axios";

let genres = [
    "Fiction", "Literature", "Classics", "Poetry", "Drama", "Mystery",
    "Science Fiction", "Fantasy", "Horror", "Romance", "Thriller",
    "Biography", "Memoir", "History", "Philosophy", "Psychology",
    "Science", "Technology", "Self-Help", "Health", "Fitness",
    "Religion", "Business", "Economics", "Politics", "Sociology",
    "Children's Books", "Young Adult", "Fairy Tales", "Picture Books",
];

genres = genres.map(genre => genre.toLowerCase());

const fetchBookDescription = async (bookKey) => {
    try 
    {
        const url = `https://openlibrary.org${bookKey}.json`;
        const response = await axios.get(url);

        if (response.data.description) 
        {
            return response.data.description.value || response.data.description;
        } 
        
        if (response.data.excerpts && response.data.excerpts.length > 0) 
        {
            return response.data.excerpts[0].text;
        }

        return null;
    } 
    catch (error) 
    {
        console.error(`Error fetching description for ${bookKey}:`, error);
        return null;
    }
};

const fetchBookCover = async (title) => {
    try 
    {
        const title_req = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`;
        const req_data = await axios.get(title_req);

        if (!req_data.data.docs || req_data.data.docs.length === 0) 
        {
            return null;
        }

        const cover_key = req_data.data.docs[0].cover_edition_key;
        if (!cover_key) return null;

        return `https://covers.openlibrary.org/b/olid/${cover_key}-L.jpg`;
    } 
    catch (error) 
    {
        return null;
    }
};

const fetchAuthorImage = async (authorKeys) => {
    for (const authorKey of authorKeys) 
    {
        try 
        {
            const url = `https://openlibrary.org${authorKey}.json`;
            const response = await axios.get(url);
            
            if (response.data.photos && response.data.photos.length > 0) 
            {
                return `https://covers.openlibrary.org/a/id/${response.data.photos[0]}-L.jpg`;
            }
        } 
        catch (error) 
        {
            console.error(`Error fetching image for ${authorKey}:`, error);
        }
    }
    return null;
};

const fetchBooksByGenre = async (genre) => {
    const url = `https://openlibrary.org/subjects/${encodeURIComponent(genre.toLowerCase())}.json?limit=1000`;
    try 
    {
        const response = await axios.get(url);
        const books = response.data.works || [];

        const filteredBooks = await Promise.all(
            books.map(async (book) => {
                if (!book.title || !book.authors || !book.key || !book.subject || !book.first_publish_year) 
                {
                    return null;
                }

                const title = book.title;
                const authorKeys = book.authors.map(a => a.key);
                const bookKey = book.key;
                const subjects = book.subject.filter(subj => genres.includes(subj.toLowerCase()));

                if (authorKeys.length === 0 || subjects.length === 0) 
                {
                    return null;
                }

                const book_cover = await fetchBookCover(title);
                if (!book_cover) return null;

                const book_description = await fetchBookDescription(bookKey);
                if (!book_description) return null;

                let authorImage = await fetchAuthorImage(authorKeys);
                if (!authorImage) return null;

                return {
                    title,
                    authors: book.authors.map(a => a.name),
                    publish_year: book.first_publish_year,
                    book_description,
                    book_genres: subjects,
                    book_cover,
                    authorImage,
                    key: bookKey,
                };
            })
        );

        return filteredBooks.filter((book) => book !== null);
    } 
    catch (error) 
    {
        console.error(`Error Fetching Books for Genre: ${genre}`, error);
        return [];
    }
};

export const getBooksData = async (req, res) => {
    try 
    {
        const booksResults = await Promise.all(genres.map(fetchBooksByGenre));
        const booksCollection = booksResults.flat();

        const uniqueBooks = [];
        const seen = new Set();

        for (const book of booksCollection) 
        {
            const key = book.key;
            if (!seen.has(key)) 
            {
                seen.add(key);
                uniqueBooks.push(book);
            }
        }

        res.json({ books: uniqueBooks });
    } 
    catch (error) 
    {
        console.error("Error Fetching Book Data: ", error);
        res.status(500).json({ error: "Failed to fetch book data" });
    }
};
