import express from "express";

export default function dashboard(db){

    const router = express.Router();
     const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        var date= `${day}-${month}-${year}`;
   
    router.get("/",async (req,res)=>{
        if(req.isAuthenticated()){
           const psfRecord = await db.query(
                                `SELECT 
                                    psf.psf_id,
                                    psf.faculty_id,
                                    psf.psf_status,
                                    psf.year,
                                    f.faculty_name,
                                    p.program_name,
                                    pcs.duration,
                                    c.class_name,
                                    sec.section_name,
                                    s.subject_name,
                                    pcs.program_id,
                                    STRING_AGG(DISTINCT TO_CHAR(a.adate, 'YYYY-MM'), ',' ORDER BY TO_CHAR(a.adate, 'YYYY-MM')) AS months
                                FROM program_subject_faculty psf
                                JOIN program_subject_group psg ON psf.psg_id = psg.psg_id
                                INNER JOIN program_class_section pcs ON psg.program_id = pcs.program_id
                                INNER JOIN program p ON pcs.p_id = p.p_id
                                INNER JOIN class c ON pcs.class_id = c.class_id
                                INNER JOIN section sec ON pcs.section_id = sec.section_id
                                INNER JOIN subject s ON psg.subject_id = s.subject_id
                                JOIN faculty f ON psf.faculty_id = f.faculty_id
                                    LEFT JOIN attendance a ON a.psf_id = psf.psf_id
                                    LEFT JOIN enrollment e ON a.enrollment_id = e.enrollment_id
                                    LEFT JOIN student st ON e.student_id = st.student_id
                                WHERE psf.faculty_id = $1
                                GROUP BY psf.psf_id, psf.faculty_id, f.faculty_name,pcs.duration, p.program_name, c.class_name, sec.section_name, s.subject_name, pcs.program_id
                                ORDER BY pcs.duration,psf.psf_id`,
                                [req.user.faculty_id]
                                );
            //we store this data in session because it will be used again in several areas
            req.session.psfRecord = psfRecord.rows; 

            console.log("User ID:", req.user.faculty_id, "--Months: ",psfRecord.rows[0].months);
                               
            res.render("dashboard.ejs",{
                userData: req.user,
                psfData:  req.session.psfRecord,
                date: date
            });
        }else{
            res.render("index.ejs",{message:"please login first",error:"error"});
        }
    });



    return router;
}