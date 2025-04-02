import multer, { MulterError } from 'multer';
import path from 'path';
import fs from "fs"

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    const uploadDir = './public/uploads';

    fs.access(uploadDir, fs.constants.F_OK, (err) => {

      if (err) {
        // Directory doesn't exist, create it
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);  // Proceed with the upload
    });
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    const nameWithoutExt = path.parse(originalName).name;
    const fileExtension = path.extname(originalName);

    const newFilename = `${nameWithoutExt}-${timestamp}${fileExtension}`;

    cb(null, newFilename);
  }
});

const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (fileExtension === '.jpeg' || fileExtension === '.jpg' || fileExtension === '.png') {
    cb(null, true);
  } else {

    const error = new Error("Invalid file type. Only .jpeg, .jpg, .png files are allowed.");
    error.status = 400;
    error.message = "Invalid file type. Only .jpeg, .jpg, .png files are allowed.";

    cb(error);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export { upload }
