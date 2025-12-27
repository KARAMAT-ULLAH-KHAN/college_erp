
function setExamValue(value) {
  let elements = document.getElementsByClassName("exam");
  for (let i = 0; i < elements.length; i++) {
    elements[i].value = value;
  }
}
function archive() {
  var x = document.getElementById("archive");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
function toggleMenu() {
  var menu = document.getElementById("dropdownMenu");
  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "flex";
  } else {
    menu.style.display = "none";
  }
}

// Optional: Close the menu when clicking outside of it
document.addEventListener("click", function (event) {
  var isClickInside = document.querySelector(".logout").contains(event.target);
  var menu = document.getElementById("dropdownMenu");

  if (!isClickInside) {
    menu.style.display = "none";
  }
});
// window.addEventListener('DOMContentLoaded', function() {
// 	var psfDuration = document.getElementsByClassName('psf2');
// 	if (psfDuration) {
// 		for (let i = 0; i < psfDuration.length; i++) {
// 				psfDuration[i].style.display = 'none';
// 			}

// 	}
// });

var highlightableCells = document.getElementsByClassName('redA');
console.log(highlightableCells);
		// Loop through each cell and check the content
		for (var j = 0; j < highlightableCells.length; j++) {
			var cell = highlightableCells[j];
			if (cell.textContent.trim() === 'A') {
				cell.classList.add('redit');
			}
      if (cell.textContent.trim() === 'L') {
				cell.classList.add('greenit');
			}
		}