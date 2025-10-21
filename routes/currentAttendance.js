import express from "express";

const router = express.Router();

export default function attendance(db){
    const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        var date= `${day}-${month}-${year}`;
        var pgdate= `${year}-${month}-${day}`;

    router.post("/currentAttendance",async (req,res)=>{

         if(req.isAuthenticated()){
           
                const classRecord = await db.query(`select 
                                s.class_no,
                                s.student_name,
                                s.inter_bs,
                                s.year,
                                p.p_id,
                                c.class_name,
                                p.program_name,
                                c.class_name,
                                sec.section_name,
                                e.enrollment_id 
                                FROM enrollment e
                                JOIN student s ON e.student_id = s.student_id  
                                INNER JOIN program_class_section pcs ON e.program_id = pcs.program_id
                                INNER JOIN program p ON pcs.p_id = p.p_id
                                INNER JOIN class c ON pcs.class_id = c.class_id
                                INNER JOIN section sec ON pcs.section_id = sec.section_id
                                WHERE pcs.program_id=$1 AND e.active=false 
                                ORDER BY s.class_no ASC`,
                                [req.body.pid]
                            );
            
           


            console.log("User ID:", req.user.faculty_id, "- program_id ",req.body.pid);
            console.log("Class record", classRecord.rows[0].program_name);

            res.render("./attendance/currentAttendance.ejs",{
                userData: req.user,
                psfData:  req.session.psfRecord,
                classData:  classRecord.rows,
                date: date
            });
        }else{
            res.render("index.ejs",{message:"please login first",error:"error"});
        }
    });

    router.post("/saveAttendance", async (req, res) => {
      if (req.isAuthenticated()) {
        const { attendance, psfid } = req.body;

        // Loop through each student's attendance
        let values=[];
        for (const enrollmentid in attendance) {
          const status = attendance[enrollmentid];
          console.log(`Enrollment ${enrollmentid}: ${status}`);
          values.push(`(${psfid},${enrollmentid},'${pgdate}','${status}','${pgdate}',false)`);
        }
        const checkAttendance = await db.query(`select * from attendance 
                                    where psf_id=$1 AND adate=$2`,[psfid,pgdate]);
        if(checkAttendance.rows.length>0){
            res.render("./dashboard.ejs",{
                userData: req.user,
                psfData:  req.session.psfRecord,
                date: date,
                warning : "Record for current date already exists"
            });
        }else{
            const insertAttendance = await db.query(`
                    INSERT INTO attendance (psf_id,enrollment_id,adate,status,marking_date,fine_collection)
                    VALUES ${values.join(",")}
                    `);
                    if(insertAttendance){
                      res.send("data successfully handled")
                    }
        console.log(values);
        }
        
      } else {
        res.render("index.ejs", {
          message: "please login first",
          error: "error",
        });
      }
    });




    return router;
}