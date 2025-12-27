
		function printpdf() {
			//console.log("printpdf function called");

			// Create a new jsPDF instance
			var doc = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'legal' // Wider than A4
                    });

			// Get the table element by its ID
			var table = document.getElementById('myTable');

			// Convert the table to PDF using the autoTable plugin
			doc.autoTable({
                html: table,
                startY: 20,
                theme: 'grid',               // 🔥 adds borders around all cells
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    lineWidth: 0.2,            // border thickness
                    lineColor: [200, 200, 0],     // black border
                },
                headStyles: {
                    fontSize: 8,
                    fillColor: [230, 230, 230], // light gray header
                    textColor: [0, 0, 0],
                },
                bodyStyles: {
                    fontSize: 8
                },
                tableLineWidth: 0.4,   //outer box border
                tableLineColor: [200, 200, 0],   //outer box border
                tableWidth: 'auto'   //outer box border
                });

			// Get the total number of pages in the PDF
			var totalPages = doc.internal.getNumberOfPages();

			//get date from attendance page
			var title = document.getElementById('discipline').innerText;
			var month = document.getElementById('month').innerText;
			 var dateValue = document.getElementById('head-date').innerText;
			 var cTitle = document.getElementById('college-title').innerText;
			// var psnameValue = document.getElementById('psname').innerText;
			// var formy = document.getElementById('formy').innerText;

			// Loop through each page to add text at the top
			for (var i = 1; i <= totalPages; i++) {
				// Go to the specific page
				doc.setPage(i);

				// Set font size and type (optional)
				doc.setFontSize(10); // Set font size to 12
				doc.setFont("helvetica"); // Set font type to helvetica

				// Add text at the top of the page
				doc.text(cTitle, 100, 5); // Adjust the position (10, 10) as per your requirement
				// doc.text("Instructor: " + fnameValue, 50, 10); // Adjust the position (10, 10) as per your requirement
				doc.text("Attendance for: " + month, 250, 10); // Adjust the position (10, 10) as per your requirement
				doc.text("Discipline: " + title, 15, 10); // Adjust the position (10, 10) as per your requirement
				doc.text("Print "+dateValue, 15, 210); // Adjust the position (10, 10) as per your requirement
				doc.text("Page  " + i + " of " + totalPages, 280, 210); // Adjust the position (10, 10) as per your requirement

			}


			// Save the PDF with a specific name (e.g., myTable.pdf)
			doc.save('GDCM-SAMS - ' + title + '.pdf');
		}

 
function setExamValue(exam) {
  document.getElementById("exam").value = exam;
}

function toggleAttendance(button) {
  var attendanceValue = button.value;

  const enrollmentId = button.dataset.enrollment;
  const hiddenInput = document.querySelector(
    `input[name="attendance[${enrollmentId}]"]`
  );

  // Toggle attendance status
  attendanceValue = attendanceValue === "A" ? "P" : "A";

  // Update button value attribute
  button.value = attendanceValue;
  hiddenInput.value = attendanceValue;
  // Update button text
  button.innerHTML = attendanceValue;

  if (attendanceValue === "P") {
    // Add the "highlighted" class to change the color
    button.classList.add("highlighted-green");
  } else {
    button.classList.remove("highlighted-green");
  }
}


