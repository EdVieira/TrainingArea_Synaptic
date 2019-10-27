
var learning_history;
var trainInputMinMax;
var trainOutputMinMax;
var myNetwork = null;

function reset() {
	document.querySelector('.terror').innerHTML = '0.0';
	document.querySelector('.iterations').innerHTML = '0.0';
	document.querySelector('.verror').innerHTML = '0.0';
	myNetwork = null;
}

function getMatrix(elem)	{
	var res = document.getElementById(elem).value.trim();
	res = res.replace(/\n/g, "],[");
	res = res.replace(/\t/g, ",");
	res = "[["+res+"]];";	
	return res;
}

function setDownloadString(str, elem)	{
	var linkstr = "data:application/octet-stream,";
	linkstr += encodeURI(str);
	document.querySelector(elem).href = linkstr;
}

function saveNetwork() {
	if (myNetwork) {
		var netStr = JSON.stringify(myNetwork);
		setDownloadString(netStr, '#saveNetwork');
	}
}

function learn(){
console.log('learn()');
	// get attributes
	netlen = "netlen = ["+document.getElementById('netlen').value+"];";
	loops = "loops = "+document.getElementById('loops').value+";";
	rate = "rate = "+document.getElementById('rate').value+";";
	var res = getMatrix('inpnotnorm');
	inpmatx = "inpmatx = "+res+";";
	var res = getMatrix('outnotnorm');
	outmatx = "outmatx = "+res+";";
	appendBody('script', netlen);
	appendBody('script', loops);
	appendBody('script', rate);
	appendBody('script', inpmatx);
	appendBody('script', outmatx);

	// initiate a network element
	if (!myNetwork)	{
		myNetwork = newNetwork(netlen);
	}

	// train it
	learning_history = learnBPP( net = myNetwork,
		inputs = inpmatx,
		outputs = outmatx,
		loops = loops,
		learningRate = rate);
	document.querySelector('#saveButton').style.display = 'block';
	return myNetwork;
}

function tryit(n){
	console.log('tryit('+n+')');
	//var tryit_act =  "try_val = ["+document.getElementById('tryit').value+"];";
	//appendBody('script', tryit_act);
	var aux = document.getElementById('tryit').value.trim().split('\n');
	var try_val = [];
	for (var i = 0; i < aux.length; i++) {
		var columns = aux[i].split('\t')
		for (var j = 0; j < columns.length; j++) {
			columns[j] = parseFloat(columns[j]);
		}
		try_val[try_val.length] = columns;
	}
	document.getElementById('res').innerHTML = '';
	for (var i = 0; i < try_val.length; i++) {
		if(trainInputMinMax){
			try_val[i] = scaleVector(try_val[i], trainInputMinMax);	
		}
		var res = n.activate(try_val[i]);
		if(trainOutputMinMax){
			res = unscale(res,trainOutputMinMax);
		}
		document.getElementById('res').innerHTML += res.toString().replace(/,/g, '\t')+'\n';
	}
}

function fitMinMaxScaler(dtMatrix)	{
	var maxincolumn = [];
	for (var i = 0; i < dtMatrix[0].length; i++){
		maxincolumn.push(dtMatrix[0][i]);
	}
	var minincolumn = [];
	for (var i = 0; i < dtMatrix[0].length; i++){
		minincolumn.push(dtMatrix[0][i]);
	}

	for (var i = 0; i < dtMatrix.length; i++) {
		for (var j = 0; j < dtMatrix[0].length; j++) {
			if(dtMatrix[i][j] > maxincolumn[j]) {
				// Max value from each column
				maxincolumn[j] = dtMatrix[i][j];
			}
			if(dtMatrix[i][j] < minincolumn[j]) {
				// Min value from each column
				minincolumn[j] = dtMatrix[i][j];
			}
		}
	}
	return {maxincolumn, minincolumn};
}

function scale(dtMatrix, minMaxColumns)	{
	for (var i = 0; i < dtMatrix.length; i++) {
		dtMatrix[i] = scaleVector(dtMatrix[i], minMaxColumns);
	}
	return dtMatrix;
}
function scaleVector(vector, minMaxColumns)	{
	for (var j = 0; j < vector.length; j++) {
		xi = vector[j];
		var amplitude = (minMaxColumns.maxincolumn[j]-minMaxColumns.minincolumn[j]);
		var observation = (xi - minMaxColumns.minincolumn[j]);
		if (observation < 0) {
			observation = 0;
		}
		vector[j] = observation/amplitude;
		if (vector[j] > 1) {
			vector[j] = 1;
		}
	}
	return vector;
}
function unscale(vector, minMaxColumns)	{
	for (var j = 0; j < vector.length; j++) {
		var amplitude = (minMaxColumns.maxincolumn[j]-minMaxColumns.minincolumn[j]);
		vector[j] = vector[j] * amplitude;
		vector[j] = vector[j] + minMaxColumns.minincolumn[j];
	}
	return vector;
}

function scaleData(elem, target) {
	console.log('normalizedata('+elem+','+target+')');

	var res = getMatrix(elem);
	var dtx = "datamatrix = "+res+";";

	appendBody('script', dtx);
	var minMaxScaler = fitMinMaxScaler(datamatrix);
	// Normalize the data
	datamatrix = scale(datamatrix, minMaxScaler)
	// Write into target textarea
	document.getElementById(target).value = "";
	for (var i = 0; i < datamatrix.length; i++) {
		if (i != 0) {
			document.getElementById(target).value += "\n";
		} 
		for (var j = 0; j < datamatrix[i].length; j++) {
			document.getElementById(target).value += datamatrix[i][j];
			if (j < datamatrix[i].length-1){
				document.getElementById(target).value += "\t";
			}
			//xi = datamatrix[i][j];
			//datamatrix[i][j] = (xi - minincolumn[j])/(maxincolumn[j]-minincolumn[j]);
		}
	}
	return minMaxScaler;
}

function appendBody(elem, content) {
	console.log('appendBody('+elem+','+content+')');
	var node = document.createElement(elem);
	var textnode = document.createTextNode(content);
	node.appendChild(textnode);
	document.body.appendChild(node);
}

function loadNetworkFromJsonFile(evt) {
	var files = evt.target.files; // FileList object
	// Loop through the FileList and get the json netowrk
	for (var i = 0, f; f = files[i]; i++) {
		// Only process image files.
		if (!f.type.match('application/json')) {
			alert('Invalid file type. Choose a JSON file.')
		}

		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function(theFile) {
			return function(e) {
				// Render thumbnail.
				var filestream = e.target.result.toString();
				var netAux = filestream.split(',')[1];
				netAux = atob(netAux); // from Base64 to text
				netAux = JSON.parse(netAux);
				myNetwork = Network.fromJSON(netAux);
			};
		})(f);
		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	}
}

document.getElementById('files').addEventListener('change', loadNetworkFromJsonFile, false);