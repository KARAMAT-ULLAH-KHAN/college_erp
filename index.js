import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import bcrypt from "bcrypt";
import registerRoute from "./routes/register.js";
import forgotPassword from "./routes/forgotPassword.js";
import Login from "./routes/login.js";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import dashboard from "./routes/dashboard.js";
import logout from "./routes/logout.js";


const app = express();
const port = 3000;

env.config();
//using middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
                user: process.env.PG_USER,
                host: process.env.PG_HOST,
                database: process.env.PG_DATABASE,
                password: process.env.PG_PASSWORD,
                port: process.env.PG_PORT,
        });
db.connect();

app.use(
    session({
        secret:"its my secret",
        resave:false,   //stroing session data into postgreSQL, but for now, no need 
        saveUninitialized:true, //  session will be stored locally
        cookie:{
            maxAge: 1000*60*60
        }
    })
)
//these must be include after the above session code
app.use(passport.initialize());
app.use(passport.session());


app.get("/",(req,res)=>{
    res.render("index.ejs");
    console.log("inside /");
});


app.use("/forgot-password",forgotPassword(db,bcrypt));
app.use("/login",Login(db,bcrypt));
app.use("/register",registerRoute(db,bcrypt));
app.use("/dashboard",dashboard(db));
app.use("/logout",logout());



app.listen(port,()=>{
    console.log(`server is listening on port ${port}`);
});