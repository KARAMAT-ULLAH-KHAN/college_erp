import express from "express";

const router = express.Router();

export default function monthlyAttendance(db) {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  var date = `${day}-${month}-${year}`;
  var pgdate = `${year}-${month}-${day}`;

  function lastDay(year, month) {
     return new Date(year, month, 0).getDate();
  }

  router.post("/", async (req, res) => {
    if (req.isAuthenticated()) {
      const postPid = req.body.pid;
      const postPsfid = req.body.psfid;
      const activeFlag = (req.body.activeFlag==0?"false":"true");

      const startDate = req.body.month;
      const [sYear, sMonth,sDay] = startDate.split("-"); // splitting date to seperate variables
      const endDate = `${sYear}-${sMonth}-${lastDay(sYear,sMonth)}`; // geting last date of each month from latDay()
      console.log(endDate);
      const totalDays = await db.query(
                   `SELECT DISTINCT TO_CHAR(adate, 'YYYY-MM-DD') AS adate from attendance 
										JOIN program_subject_faculty ON attendance.psf_id=program_subject_faculty.psf_id
										WHERE attendance.psf_id=$1 AND adate Between $2 AND $3
                    ORDER BY adate 
                    `,[postPsfid,startDate,endDate]); 

      if(totalDays.rows.length>0){

        //when we query adate (if it’s a DATE column), Node.js will convert it
        //  to a JS Date object, and in EJS printing it directly will show the 
        // timestamp with timezone (2025-12-01T00:00:00.000Z).
        //so we converting it and just sending days for first row
        // and access it using day
        // ['1','2','3', ...]
        const formattedTotalDays = totalDays.rows.map(row => {
              return {
                day: Number(row.adate.split("-")[2])
              };
            });

        const dates = totalDays.rows.map(r => r.adate); 
          // e.g., ['2025-10-01', '2025-10-02', '2025-10-03']
        // console.log("DATES ARRAY:", dates);
        // console.log("FIRST DATE:", dates[0]);
        // console.log("totals dates:", totalDays);
        const getStatus = await db.query(`
                SELECT std.class_no,
                      STRING_AGG(a.status, ',' ORDER BY a.adate) AS statuses,
                      STRING_AGG(a.adate::date::text, ',' ORDER BY a.adate) AS dates_str
                FROM attendance a
                JOIN enrollment e ON a.enrollment_id = e.enrollment_id
                JOIN student std ON e.student_id = std.student_id
                WHERE a.psf_id = $1
                  AND e.active = $2
                  AND a.adate BETWEEN $3 AND $4
                GROUP BY std.class_no
            `, [postPsfid, activeFlag,startDate, endDate]);

          // console.log(getStatus.rows);

          const finalData = getStatus.rows.map(row => {
                const statusArray = row.statuses.split(','); //splitting each status and make one element of statusArray 
                const dateArray = row.dates_str.split(','); //splitting each date and make one element of dateArray 

                const statusByDate = {};  //create objects and store like date:status
                dateArray.forEach((d, i) => {
                    statusByDate[d] = statusArray[i];   //statusByDate["2025-10-01"] = "p";
                });

                // now build row with all dates
                //e.g
                // rowData = {
                //   class_no: "101",
                //   "2025-10-01": "P",
                //   "2025-10-02": "A",
                //   "2025-10-03": "P",
                //   "2025-10-04": "X"   // no data → X
                // };

                const rowData = { class_no: row.class_no };
                dates.forEach(d => {
                    rowData[d] = statusByDate[d] || 'X'; // put 'X' if missing
                });

                return rowData;
            });
            // console.log(finalData);
        res.render("./attendance/monthlyAttendance.ejs", {
          days: formattedTotalDays,
          rowsData: finalData, 
          rowDates:dates,

          userData: req.user,
          psfData: req.session.psfRecord,
          psfid:  postPsfid,
          date: date,
        });
      }else{
        const monthNames = [
														"Jan","Feb","Mar","April","May","June",
														"July","Aug","Sept","Oct","Nov","Dec" ]; 
        let monthName = monthNames[parseInt(sMonth)-1];
        const msg=`${monthName} - ${sYear} - attendance record not available`;
                res.redirect(`/dashboard?warning=${msg}`);
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
