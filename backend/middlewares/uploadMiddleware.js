const multer = require('multer');

//Configure storage
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'uploads/')
    },
    filename: (req,file,cb) => {
        cb(null,`${Date.now()}-${file.originalname}`);
    },
});

//File Filter
const filefilter = (req,file,cb) => {
    const allowedTypes = ['images/jpeg','images/png','images/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null,true);
    }else{
        cb(new Error('Only .jpeg, .jpg and .png formats are allowed.'),false);
    }
};

const upload = multer({storage,filefilter});

module.exports = upload;