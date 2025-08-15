import express from "express";
import passport from "passport";
import { Strategy } from "passport-local";

export default function Login(db,bcrypt){
  const router = express.Router();

  router.post("/", (req,res,next) => {
    //const username = req.body.username;    these lines will be covered by passport local strategy
    //const password = req.body.password;

    
      passport.authenticate("local", (err, user, info) => {
        // we have to add local keyword
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.render("index", {
            error: info?.message || "User not found",
            username: req.body.username,
          });
        }
        req.login(user, (err) => {
          //this login with small i is passport thing
          if (err) {
            return next(err);
          }
          return res.redirect("/dashboard");
        });
      })(req, res, next);
    });

    passport.use(
      new Strategy(async function verify(username, password, cb) {
        //here username and password is got from
        //  req.body by passport
        try {
          const result = await db.query(
            "select * from faculty where faculty_name = $1",
            [username]
          );
          if (result.rows.length > 0) {         //if user name is found
            const user = result.rows[0];
            const storedPassword = user.password;
            bcrypt.compare(password, storedPassword, async (err, result) => {
                if(err){
                    return cb(err);     //something wrong with query result
                }else{
                    if (result) {
                        return cb(null,user);   //user data true
                    } else {
                        return cb(null,false,{message: "User Password incorrect"});
                    }
                }
              
            });
          } else {      //iff username is incorrect or not available
                return cb(null,false,{message:"username does not exist"})
          }
        } catch (err) {
          console.log(err);
        }
      })
    );
  //in orderr to store data into session
  passport.serializeUser((user,cb)=>{
    cb(null,user);
  });
  // for retrieving data from session
  passport.deserializeUser((user,cd)=>{
    cd(null,user);
  });

  return router;
}