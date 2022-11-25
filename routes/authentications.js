const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { signout, signup, signin} = require("../controllers/authentications");
const multer = require('multer');
const upload = multer({dest: "./image"});
const {uploadFile, getFileStream} = require("../controllers/s3");
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

//register:
router.post(
  "/signup",
  [
    check("email", "Email is required").isEmail(),
    check("first_name", "name should be atlest 3 char").isLength({ min: 3 }),
    check("password", "password should be atleast 8 char").isLength({ min: 8 }),
  ],
  signup
);

//login:
router.post(
  "/signin",
  [
    check("email", "Email is required").isEmail(),
    check("password", "password should be atleast 8 char").isLength({ min: 8 }),
  ],
  signin
);

//image:--upload:
router.post("/upload", upload.single('image'), async(req, res)=>{
  const file = req.file
  const result = await uploadFile(file);
  await unlinkFile(file.path);
  res.send({imagePath:`/images/${result.Key}`});
});

//image:--get:
router.get('/images/:key', (req, res) =>{
  const key = req.params.key
  const readStream = getFileStream(key);
  readStream.pipe(res);
})

router.get("/signout", signout);

module.exports = router;