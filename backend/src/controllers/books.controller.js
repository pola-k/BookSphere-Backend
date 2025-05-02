import { Sequelize} from "sequelize"
import Book from "../models/book.js"
import Author from "../models/author.js"
import Genre from "../models/genre.js"
import Book_Author from "../models/book_author.js"
import Book_Genre from "../models/book_genre.js"
import assoications from "../models/associations.js"

export const getBooksDataByGenre = async (req, res) => {
    const genre = req.params.genre;

    try {
        const books = await Book.findAll({
            include: [
                {
                    model: Genre,
                    where: { name: genre },
                    through: { attributes: [] }
                }
            ],
            attributes: ['id'],
            order: Sequelize.fn('RANDOM'),
            limit: 15
        });

        const bookIds = books.map(book => book.id);

        if (bookIds.length === 0) 
        {
            return res.status(404).json({ message: "No books found for this genre" });
        }

        const fullBooks = await Book.findAll({
            where: { id: bookIds},
            attributes: {
                include: [
                  [
                    Sequelize.literal(`(
                      SELECT COALESCE(COUNT(*), 0)
                      FROM "ratings"
                      WHERE "ratings"."book_id" = "Book"."id"
                    )`),
                    'ratingCount'
                  ],
                  [
                    Sequelize.literal(`(
                      SELECT COALESCE(AVG("ratings"."score"), 0)
                      FROM "ratings"
                      WHERE "ratings"."book_id" = "Book"."id"
                    )`),
                    'averageRating'
                  ]
                ]
              },
            include: [
                {
                    model: Genre,
                    through: { attributes: [] } 
                },
                {
                    model: Author,
                    through: { attributes: [] }
                },
            ]
        });

        res.json(fullBooks); 
    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ error: "Error fetching books data" });
    }
};

export const getLatestBooksData = async (req, res) => {
    try {
        const books = await Book.findAll({
            attributes: ['id'],
            order: [["publish_date", "DESC"]],
            limit: 15
        });

        const bookIds = books.map(book => book.id);

        if (bookIds.length === 0) 
        {
            return res.status(404).json({ message: "No books found" });
        }
        
        const fullBooks = await Book.findAll({
            where: { id: bookIds},
            attributes: {
                include: [
                  [
                    Sequelize.literal(`(
                      SELECT COALESCE(COUNT(*), 0)
                      FROM "ratings"
                      WHERE "ratings"."book_id" = "Book"."id"
                    )`),
                    'ratingCount'
                  ],
                  [
                    Sequelize.literal(`(
                      SELECT COALESCE(AVG("ratings"."score"), 0)
                      FROM "ratings"
                      WHERE "ratings"."book_id" = "Book"."id"
                    )`),
                    'averageRating'
                  ]
                ]
              },
            include: [
                {
                    model: Genre,
                    through: { attributes: [] } 
                },
                {
                    model: Author,
                    through: { attributes: [] }
                },
            ]
        });

        res.json(fullBooks); 
    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ error: "Error fetching latest books data" });
    }
}


export const getBooksDataById = async (req, res) => {
    const id = req.params.id
    try
    {
        const book = await Book.findOne({
            where: { id },
            attributes: {
              include: [
                [
                  Sequelize.literal(`(
                    SELECT COALESCE(COUNT(*), 0)
                    FROM "ratings"
                    WHERE "ratings"."book_id" = "Book"."id"
                  )`),
                  'ratingCount'
                ],
                [
                  Sequelize.literal(`(
                    SELECT COALESCE(AVG("ratings"."score"), 0)
                    FROM "ratings"
                    WHERE "ratings"."book_id" = "Book"."id"
                  )`),
                  'averageRating'
                ]
              ]
            },
            include: [
              {
                model: Author,
                through: { attributes: [] }
              },
              {
                model: Genre,
                through: { attributes: [] }
              },
            ]
          });
          
        res.json(book)
    }
    catch(error)
    {
        console.error(error)
        res.status(500).json({ error: "Error fetching books data" })
    }
}

export const getAllBooksIDs = async (req, res) => {
    try 
    {
        const bookIds = await Book.findAll({ attributes: ['id'] });
        const ids = bookIds.map(book => book.id);
        res.json(ids);
    }
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ error: "Error fetching book IDs" });
    }
}

export const getTrendingBooksData = async (req, res) => {
  try 
  {
      const trendingBooks = await Book.findAll({
          attributes: ['id'],
          order: [
              [Sequelize.literal(`(
                  SELECT COALESCE(AVG("ratings"."score"), 0)
                  FROM "ratings"
                  WHERE "ratings"."book_id" = "Book"."id"
              )`), 'DESC']
          ],
          limit: 15
      });

      const bookIds = trendingBooks.map(book => book.id);

      if (bookIds.length === 0) 
      {
          return res.status(404).json({ message: "No trending books found" });
      }

      const fullBooks = await Book.findAll({
          where: { id: bookIds },
          attributes: {
              include: [
                  [
                      Sequelize.literal(`(
                          SELECT COALESCE(COUNT(*), 0)
                          FROM "ratings"
                          WHERE "ratings"."book_id" = "Book"."id"
                      )`),
                      'ratingCount'
                  ],
                  [
                      Sequelize.literal(`(
                          SELECT COALESCE(AVG("ratings"."score"), 0)
                          FROM "ratings"
                          WHERE "ratings"."book_id" = "Book"."id"
                      )`),
                      'averageRating'
                  ]
              ]
          },
          include: [
              {
                  model: Genre,
                  through: { attributes: [] }
              },
              {
                  model: Author,
                  through: { attributes: [] }
              },
          ]
      });

      res.json(fullBooks);
  } 
  catch (error) 
  {
      console.error(error);
      res.status(500).json({ error: "Error fetching trending books data" });
  }
};