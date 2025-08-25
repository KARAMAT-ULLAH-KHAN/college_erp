import express from "express";

export default function registerRoute(db,bcrypt){

    const router = express.Router();
    
    const saltround=5;

router.get("/", async(req,res)=>{
    try {
        
        const result = await db.query("select * from department ORDER BY department_id");
        if(result.rows.length>0){
            const data = result.rows;
        res.render("register.ejs",{data});
        }
        else{
            console.log("table is empty");
        }

    } catch (error) {
        console.log(error);
    }
    });
router.post("/",async(req,res)=>{
    console.log("inside regpost");
    const username = req.body.username;
    const password = req.body.password;
    const contactNo = req.body.contactNo;
    const designation = req.body.designation;
    const department = req.body.department;
try {
    const checkUser = await db.query("select * from faculty where faculty_name=$1",[username]);
    if(checkUser.rows.length > 0){
        res.send(`Username ${checkUser.rows[0].faculty_name} Already Exist, try another name`);
    }else{
        bcrypt.hash(password,saltround,async(err,hash)=>{

        const result = await db.query("INSERT INTO faculty (faculty_name,designation,contact_no,department_id,access_level,password) values ($1,$2,$3,$4,$5,$6) RETURNING *",[username,designation,contactNo,department,0,hash]);
        const user = result.rows[0];
        req.login(user,(err)=>{
            res.redirect("/dashboard");
        }); 
        
        console.log(result.rows);

    });
    }
    
} catch (error) {
    console.log(error);
}
});
    return router;
}