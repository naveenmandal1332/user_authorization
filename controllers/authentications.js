const User = require("../models/user");
const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");
const transporter = require("./emailVerification");
const dotenv = require("dotenv");
dotenv.config();

//register:
exports.signup = (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }

    //Email verification:
    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: req.body.email,
        subject: "Account Verification",
        test: "Please Verify your Account"
    }

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }
        else{
            console.log("email has been sent", info.response);
        }
    });

    //user saved in DB
    const user = new User(req.body);
    //create token
    const token = jwt.sign({_id: user._id}, process.env.SECRET);
    //put token in cookie:
    res.cookie("token", token, {expire: new Date() + 999});

    user.save((err, user)=>{
        if(err){
            return res.status(400).json({
                err: "NOT able to save user in DB"
            });
        }
        res.json({
            token,
            email: user.email,
            message: "Successfull registration !",
        });
    });
}

//Login:
exports.signin = (req, res )=>{
    const {email, password} = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }

    User.findOne({email}, (err, user) =>{
        if(err || !user){
            return res.status(400).json({
                error: "User email does not exist"
            })
        }

        if(!user.authenticate(password)){
            return res.status(401).json({
                error: "Email and password do not match"
            })
        }

        //create token
        const token = jwt.sign({_id: user._id}, process.env.SECRET);
        //put token in cookie:
        res.cookie("token", token, {expire: new Date() + 999});

        //Send response to frontend:
        return res.json({token, message:"Successfull login"});
    })
}

exports.signout = (req, res) =>{
    res.clearCookie("token");
    res.json({
        message: "User signout successfully"
    });
};