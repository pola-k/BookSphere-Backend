import User from "./user.js";
import Post from "./post.js";
import SavedPost from "./saved_post.js";
import Comment from "./comment.js";
import Book from "./book.js";
import Author from "./author.js";
import Genre from "./genre.js";
import BooksList from "./books_list.js";
import BookGenre from "./book_genre.js";
import BookAuthor from "./book_author.js";
import Review from "./review.js";
import Rating from "./rating.js";
import Summary from "./summary.js";
import PaymentPlan from "./payment_plan.js";
import PostLikes from "./post_likes.js";
import CommentLikes from "./comment_likes.js";

// User can have many posts
User.hasMany(Post, { foreignKey: "user_id" });
Post.belongsTo(User, { foreignKey: "user_id" });

SavedPost.belongsTo(Post, { foreignKey: "post_id", as: "post" });


// User can have many comments
User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

// Post can have many comments
Post.hasMany(Comment, { foreignKey: "post_id", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "post_id", as: "post" });

// Comment can have many comments (as replies)
Comment.hasMany(Comment, { foreignKey: "parent_id", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parent_id", as: "parent_comment" });

// User - Post Junction Table
User.belongsToMany(Post, { through: SavedPost, foreignKey: "user_id" });
Post.belongsToMany(User, { through: SavedPost, foreignKey: "post_id" });

// User - Book Junction Table (for BooksList)
User.belongsToMany(Book, { through: BooksList, foreignKey: "user_id" });
Book.belongsToMany(User, { through: BooksList, foreignKey: "book_id" });

// User can have a payment plan
User.belongsTo(PaymentPlan, { foreignKey: "plan_id", as: "plan" });
PaymentPlan.hasMany(User, { foreignKey: "plan_id" });

// Reviews and ratings belong to users
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Rating, { foreignKey: "user_id" });
Rating.belongsTo(User, { foreignKey: "user_id" });


// Reviews and ratings belong to books
Book.hasMany(Review, { foreignKey: "book_id" });
Review.belongsTo(Book, { foreignKey: "book_id" });

Book.hasMany(Rating, { foreignKey: "book_id" });
Rating.belongsTo(Book, { foreignKey: "book_id" });

// Book - Genre Junction Table
Book.belongsToMany(Genre, { through: BookGenre, foreignKey: 'BookId'});
Genre.belongsToMany(Book, { through: BookGenre, foreignKey: 'GenreId'});

// Book - Author Junction Table
Book.belongsToMany(Author, { through: BookAuthor, foreignKey: 'BookId'});
Author.belongsToMany(Book, { through: BookAuthor, foreignKey: "AuthorId" });

// Each book may have one summary
Book.hasOne(Summary, { foreignKey: "book_id", onDelete: "CASCADE" });
Summary.belongsTo(Book, { foreignKey: "book_id" });



export default { User, Post, SavedPost, Comment, Book, Author, Genre, BooksList, BookGenre, BookAuthor, Review, Rating, Summary, PaymentPlan, PostLikes, CommentLikes };