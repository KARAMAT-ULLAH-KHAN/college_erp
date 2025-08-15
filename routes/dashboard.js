import express from "express";

export default function dashboard(){

    const router = express.Router();

    router.get("/",(req,res)=>{
        if(req.isAuthenticated()){
            res.render("dashboard.ejs");
        }else{
            res.render("index.ejs",{message:"please login first",error:"error"});
        }
    });



    return router;
}