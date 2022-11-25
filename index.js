const mongoose = require("mongoose");
const dotenv = require("dotenv");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/authentications");

//Db Connections:
dotenv.config();
mongoose.connect(process.env.MONGO_URL,{
}).then(()=> console.log("DB connected")).catch((err) =>{
    console.log(err);
});

//middlewares:
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//Routes:
app.use("/api", authRoutes);

//Port:
const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`App is running at ${port}`);
});