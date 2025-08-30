import express from "express";

export default function dashboard(){

    const router = express.Router();
     const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        var date= `${day}-${month}-${year}`;
   
    router.get("/",(req,res)=>{
        if(req.isAuthenticated()){
            res.render("dashboard.ejs",{
                userData: req.user,
                date: date
            });
        }else{
            res.render("index.ejs",{message:"please login first",error:"error"});
        }
    });



    return router;
}