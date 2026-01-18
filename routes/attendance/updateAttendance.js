import express from "express";

const router = express.Router();

export default function updateAttendance(db) {
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
      if(classRecord.rows.length>0){

        res.render("./attendance/updateAttendance.ejs", {
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
      
    } else {
      res.render("index.ejs", {
        message: "please login first",
        error: "error",
      });
    }
  });

  router.post("/update", async (req, res) => {
    if (req.isAuthenticated()) {
          const { enroll_no,selectdate,status, psfid } = req.body;

          const checkAttendance = await db.query(
            `select * from attendance where psf_id=$1 AND enrollment_id=$2 AND adate=$3`,[psfid,enroll_no, selectdate]
          );

          if (checkAttendance.rows.length < 1) {
                const msg="Record for current date not exists";
                res.redirect(`/dashboard?warning=${msg}`);
          } else {

                const updateAttendance = await db.query(`
                            UPDATE attendance SET status=$1 
                            WHERE psf_id=$2 AND enrollment_id=$3 AND adate=$4 RETURNING *
                            `,[status,psfid,enroll_no,selectdate]);
                const classRecord = await db.query(
                  `select 
                                          s.class_no,
                                          s.student_name,
                                          s.inter_bs,
                                          s.year,
                                          e.enrollment_id,
                                          a.adate,
                                          a.status
                                          FROM attendance a
                                          JOIN enrollment e ON a.enrollment_id=e.enrollment_id
                                          JOIN student s ON e.student_id = s.student_id 
                                          WHERE  psf_id=$1 AND a.enrollment_id=$2 AND adate=$3
                                          `,
                  [psfid,enroll_no,selectdate]
                );             
                if (classRecord.rows.length>0) {
                    
                  res.render("./attendance/displayUpdateAttendance",{
                      userData: req.user,
                      psfData: req.session.psfRecord,
                      updatedData: classRecord.rows[0],
                      updateDate: selectdate,
                      psfid:  psfid,
                      msg:  "Attendance Updated",
                      date: date,
                  });
                } else {
                      res.render("index.ejs", {
                        message: "Attendance not Updated",
                        error: "error",
                      });
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
