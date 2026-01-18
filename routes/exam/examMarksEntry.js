import express from "express";

const router = express.Router();

export default function examMarksEntry(db) {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  var date = `${day}-${month}-${year}`;
  var pgdate = `${year}-${month}-${day}`; 

  router.post("/", async (req, res) => {
    if (req.isAuthenticated()) {
      const classRecord = await db.query(
        `select 
                                s.class_no,
                                s.student_name,
                                s.inter_bs,
                                s.year,
                                p.p_id,
                                c.class_name,
                                p.program_name,
                                c.class_name,
                                sec.section_name,
                                pcs.duration,
                                e.enrollment_id 
                                FROM enrollment e
                                JOIN student s ON e.student_id = s.student_id  
                                INNER JOIN program_class_section pcs ON e.program_id = pcs.program_id
                                INNER JOIN program p ON pcs.p_id = p.p_id
                                INNER JOIN class c ON pcs.class_id = c.class_id
                                INNER JOIN section sec ON pcs.section_id = sec.section_id
                                WHERE pcs.program_id=$1 AND e.active=true 
                                ORDER BY s.class_no ASC`,
        [req.body.pid]
      ); 
      const examList  = await db.query(`
        select * from exam
        `);
      if(classRecord.rows.length>0){ 

        res.render("./exam/examMarksEntry.ejs", {
          userData: req.user,
          psfData: req.session.psfRecord,
          classData: classRecord.rows,
          examData:examList.rows,
          psfid:  req.body.psfid,
          date: date,
        });
      }else{
        const msg="no Active students available";
                res.redirect(`/dashboard?warning=${msg}`);
      }
      
    } else {
      res.render("index.ejs", {
        message: "please login first",
        error: "error",
      });
    }
  });

  router.post("/saveMarks", async (req, res) => {
    if (req.isAuthenticated()) {
          const { exam,totalmarks,marks, psfid } = req.body;
          console.log({exam,totalmarks,marks, psfid});
          const examList  = await db.query(`select * from exam WHERE exam_id=$1`,[exam]);
          const checkExamData = await db.query(
            `select * from marks where psf_id=$1 AND exam_id=$2`,[psfid,exam]
          );

          if (checkExamData.rows.length > 0) {
                const msg=`Record for ${examList.rows[0].exam_name} exam already exists, Please go to update Section`;
                res.redirect(`/dashboard?warning=${msg}`);
          } else {

                let finalmarks = [];
                for (const enrollmentid in marks) {
                          const marksData = marks[enrollmentid];
                          console.log(`Marks ${enrollmentid}: ${marksData}`);
                          finalmarks.push(`(${enrollmentid},${psfid},'${exam}','${marksData}','${pgdate}','${totalmarks}')`
                  );
                }
          try {
                 const insertExamMarks = await db.query(`
                            INSERT INTO marks (enrollment_id,psf_id,exam_id,marks,date_of_entry,total_marks)
                            VALUES ${finalmarks.join(",")}
                            `);
                if (insertExamMarks) {
                    const msg="Marks entry Finalized";
                    res.redirect(`/dashboard?warning=${msg}`);
                   
                }
          } catch (error) {
             const msg=error;
             console.log(error);
                res.redirect(`/dashboard?warning=${msg}`);
     
          }
           
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
