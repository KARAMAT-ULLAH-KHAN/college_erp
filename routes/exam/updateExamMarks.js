import express from "express";

const router = express.Router();

export default function updateExamMarks(db) {
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

        res.render("./exam/selectExam.ejs", {
          userData: req.user,
          psfData: req.session.psfRecord,
          classData: classRecord.rows,
          examData:examList.rows,
          examUpdateFlag:   1,
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

  router.post("/display", async (req, res) => {
    if (req.isAuthenticated()) {
          const { exam, psfid } = req.body;
          console.log({exam, psfid});
          const examList  = await db.query(`select * from exam WHERE exam_id=$1`,[exam]);
          const checkExamData = await db.query(
            `select * from marks where psf_id=$1 AND exam_id=$2`,[psfid,exam]
          );

          if (checkExamData.rows.length < 1) {
                const msg=`Record for ${examList.rows[0].exam_name} exam does not exists, Please go to marking Section`;
                res.redirect(`/dashboard?warning=${msg}`);
          } else {
                const classRecord = await db.query(
                    `select 
                                            s.class_no,
                                            s.student_name,
                                            s.inter_bs,
                                            s.year,
                                            ex.*,
                                            m.*,
                                            p.p_id,
                                            c.class_name,
                                            p.program_name,
                                            sec.section_name,
                                            pcs.duration,
                                            e.enrollment_id 
                                            FROM marks m
                                            JOIN enrollment e ON m.enrollment_id=e.enrollment_id
                                            JOIN student s ON e.student_id = s.student_id  
                                            JOIN exam ex ON m.exam_id=ex.exam_id
                                            JOIN program_subject_faculty psf ON m.psf_id=psf.psf_id
                                            INNER JOIN program_class_section pcs ON e.program_id = pcs.program_id
                                            INNER JOIN program p ON pcs.p_id = p.p_id
                                            INNER JOIN class c ON pcs.class_id = c.class_id
                                            INNER JOIN section sec ON pcs.section_id = sec.section_id
                                            WHERE psf.psf_id=$1 AND ex.exam_id=$2 
                                            ORDER BY s.class_no ASC`,
                    [psfid,exam]
                ); 
                if(classRecord.rows.length>0){ 

                    res.render("./exam/updateExamMarks.ejs", {
                    userData: req.user,
                    psfData: req.session.psfRecord,
                    classData: classRecord.rows,
                    psfid:  req.body.psfid,
                    date: date,
                    });
                }else{
                    const msg="no Active students available";
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

  router.post("/updateMarks", async (req, res) => {
    if (req.isAuthenticated()) {
          const { exam,totalmarks,marks, psfid } = req.body;
          console.log({exam,totalmarks,marks, psfid});
          const examList  = await db.query(`select * from exam WHERE exam_id=$1`,[exam]);
          const checkExamData = await db.query(
            `select * from marks where psf_id=$1 AND exam_id=$2`,[psfid,exam]
          );

          if (checkExamData.rows.length < 1) {
                const msg=`Record for ${examList.rows[0].exam_name} exam does not exists, Please go to marking Section`;
                res.redirect(`/dashboard?warning=${msg}`);
          } else {

                let caseQuery = "";
                let enroll_ids = [];

                for (let enrollment_id in marks) {
                    let enterMarksData = marks[enrollment_id]==='A'? -1 :marks[enrollment_id];
                    caseQuery += ` WHEN enrollment_id = ${enrollment_id} THEN ${enterMarksData}`;
                    enroll_ids.push(enrollment_id);
                }
          try {
//concept in bellow comments
/*
JavaScript object:
marks = {
  1: 45,
  2: 38,
  3: 50
};

SQL Logic Generated
CASE
    WHEN enrollment_id = 1 THEN 45
    WHEN enrollment_id = 2 THEN 38
    WHEN enrollment_id = 3 THEN 50
END

CASE WHEN THEN END explanation:

CASE allows assigning DIFFERENT values to DIFFERENT rows
inside a single UPDATE query.

Each WHEN checks a condition (enrollment_id),
and THEN provides the value to assign (marks).

Example:
CASE
  WHEN enrollment_id = 1 THEN 45
  WHEN enrollment_id = 2 THEN 38
  WHEN enrollment_id = 3 THEN 50
END

Meaning:
- If row enrollment_id is 1 → set marks = 45
- If row enrollment_id is 2 → set marks = 38
- If row enrollment_id is 3 → set marks = 50

This updates multiple students' marks in ONE query
instead of running multiple UPDATE statements.
*/
                 const updateExamMarks = await db.query(`
                            UPDATE marks
                                SET marks = CASE
                                    ${caseQuery}
                                END,
                                total_marks = $1
                                WHERE exam_id = $2
                                AND psf_id = $3
                                AND enrollment_id IN (${enroll_ids.join(",")})
                            `,[totalmarks,exam,psfid,]);

                if (updateExamMarks) {
                    const msg="Marks Updation Finalized";
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
