
function replaceBody(file){
	fetch(file)
		.then(response => response.text())
		.then(text => {
			document.body.innerHTML = text;
		});
}