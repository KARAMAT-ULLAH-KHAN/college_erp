import express from "express";

export default function Login(db,bcrypt){

    const router = express.Router();
    
    router.post("/",async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    // console.log(username +" - "+password);
    try{
        
        const result =await db.query("select * from faculty where faculty_name = $1",[username]);
        if(result.rows.length>0){
            const user = result.rows[0];
            const storedPassword = user.password;
            bcrypt.compare(password,storedPassword,async (err,result)=>{
                    if(result){
                        res.send("Login Successfully");
                    }else{
                        res.send("Password incorrect");
                    }
            });
            
        }else{
            res.send("username does not exist");
        }
    }
    catch(err){
        console.log(err)
    }
});

    return router;
}