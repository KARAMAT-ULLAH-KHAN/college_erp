import express from "express";

const router = express.Router();

export default function displayExamMarks(db) {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  var date = `${day}-${month}-${year}`;
  var pgdate = `${year}-${month}-${day}`; 
 
   router.post("/", async (req, res) => {
    if (req.isAuthenticated()) {
                  const examList  = await db.query(`
                  select * from exam
                  `);         
                  res.render("./exam/selectExam",{
                      userData: req.user,
                      psfData: req.session.psfRecord,
                      examData: examList.rows,
                      psfid:  req.body.psfid,
                      date: date,
                  });
         
           
          
    } else {
          res.render("index.ejs", {
            message: "please login first",
            error: "error",
          });
    }
  });

    router.post("/display", async (req, res) => {
    if (req.isAuthenticated()) {
          const { exam, psfid } = req.body;
          const examList  = await db.query(`select * from exam WHERE exam_id=$1`,[exam]);
          const checkExamData = await db.query(
            `select * from marks where psf_id=$1 AND exam_id=$2`,[psfid,exam]
          );

          if (checkExamData.rows.length < 1) {
                const msg=`Record for ${examList.rows[0].exam_name} exam not exists, Please go to Marking Section`;
                res.redirect(`/dashboard?warning=${msg}`);
          } else {

           
          try {
                  const displayExamMarks = await db.query(
                    `
                        SELECT marks.*,
                        exam.*,
                        s.class_no,
                        s.student_name,
                        s.inter_bs,
                        e.enroll_year,
                        p.program_name,
                        c.class_name,
                        sec.section_name
                         FROM marks 
                        Join enrollment e on marks.enrollment_id=e.enrollment_id
                        join exam on marks.exam_id=exam.exam_id
                        join student s on e.student_id=s.student_id
                        INNER JOIN program_class_section pcs ON e.program_id = pcs.program_id
                        INNER JOIN program p ON pcs.p_id = p.p_id
                        INNER JOIN class c ON pcs.class_id = c.class_id
                        INNER JOIN section sec ON pcs.section_id = sec.section_id
                        WHERE marks.psf_id=$1 AND marks.exam_id=$2 
                        ORDER BY s.class_no
                    `,
                    [psfid,exam]
                  );
                   
                  res.render("./exam/displayExamMarks",{
                      userData: req.user,
                      psfData: req.session.psfRecord,
                      examData: displayExamMarks.rows,
                      psfid:  psfid,
                      msg:  "Marks entry Finalized",
                      date: date,
                  });
                
          } catch (error) {
             const msg=error;
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
