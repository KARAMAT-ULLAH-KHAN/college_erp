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
