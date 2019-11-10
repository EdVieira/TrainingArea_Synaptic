
var learning_history;
var inputMinMax;
var outputMinMax;
var inputOneHotEncoding;
var outputOneHotEncoding;
var myNetwork = null;

function reset() {
	document.querySelector('.terror').innerHTML = '0.0';
	document.querySelector('.test_error').innerHTML = '0.0';
	document.querySelector('.tcost').innerHTML = '0.0';
	document.querySelector('.vcost').innerHTML = '0.0';
	document.querySelector('.iterations').innerHTML = '0.0';
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
		var model = {'network':myNetwork};
		if (inputOneHotEncoding)	{
			model.inputOneHotEncoding = inputOneHotEncoding
		}
		if (inputMinMax)	{
			model.inputMinMax = inputMinMax
		}
		if (outputOneHotEncoding)	{
			model.outputOneHotEncoding = outputOneHotEncoding
		}
		if (outputMinMax)	{
			model.outputMinMax = outputMinMax
		}
		var modelStr = JSON.stringify(model);
		setDownloadString(modelStr, '#saveNetwork');
	}
}

function learn(){
console.log('learn()');
	// get attributes
	netlen = document.getElementById('netlen').value.split(',');
	for (var i in netlen)	{
		netlen[i] = parseInt(netlen[i])
	}
	loops = parseInt(document.getElementById('loops').value);
	rate = parseFloat(document.getElementById('rate').value);
	//var res = getMatrix('inpnotnorm');
	//inpmatx = "inpmatx = "+res+";";
	//var res = getMatrix('outnotnorm');
	//outmatx = "outmatx = "+res+";";
	//appendBody('script', netlen);
	//appendBody('script', loops);
	//appendBody('script', rate);
	//appendBody('script', inpmatx);
	//appendBody('script', outmatx);
	alert('Training input data...');
	var inpmatx = stringCSVtoMatrix('inpnotnorm');
	
	if (inputOneHotEncoding)	{
		inpmatx = encodeOneHot(inpmatx, inputOneHotEncoding)
	}
	if (inputMinMax)	{
		inpmatx = scale(inpmatx, inputMinMax);
	}

	alert('Training output data...');
	var outmatx = stringCSVtoMatrix('outnotnorm');
	
	if (outputOneHotEncoding)	{
		outmatx = encodeOneHot(outmatx, outputOneHotEncoding)
	}
	if (outputMinMax)	{
		outmatx = scale(outmatx, outputMinMax);
	}

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

function predict(n){
	console.log('predict('+n+')');
	//var predict_act =  "predictValues = ["+document.getElementById('predict').value+"];";
	//appendBody('script', predict_act);
	//var aux = document.getElementById('predict').value.trim().split('\n');
	var rowSep = '\n';
	var colSep = '\t';
	var predictValues = stringCSVtoMatrix('predict', rowSep, colSep);
	/*var predictValues = [];
	for (var i = 0; i < aux.length; i++) {
		var columns = aux[i].split('\t')
		for (var j = 0; j < columns.length; j++) {
			columns[j] = parseFloat(columns[j]);
		}
		predictValues[predictValues.length] = columns;
	}*/
	document.getElementById('res').innerHTML = '';
	for (var i = 0; i < predictValues.length; i++) {
		if(inputOneHotEncoding){
			res = encodeOneHot([predictValues[i]],inputOneHotEncoding);
		}
		if(inputMinMax){
			predictValues[i] = scaleVector(predictValues[i], inputMinMax);	
		}
		var res = n.activate(predictValues[i]);
		if(outputMinMax){
			res = unscale(res,outputMinMax);
		}
		if(outputOneHotEncoding){
			res = decodeOneHot(res,outputOneHotEncoding);
		}
		document.getElementById('res').innerHTML += res.toString().replace(/,/g, '\t')+'\n';
	}
}

function stringCSVtoMatrix(elem, row_separator=/\n/g, col_separator=/\t/g)	{
	if (document.getElementById('custom_separator').checked){
		var aux_col_sep = prompt('Column separator.\n(blank for tab separator)\n E.g.: ; ')
		if (aux_col_sep.length>0)	{
			col_separator = aux_col_sep;
		}	
	}
	var aux = document.getElementById(elem).value.trim().split(row_separator);
	var textAreaMatrix = [];
	for (var i = 0; i < aux.length; i++) {
		var columns = aux[i].split(col_separator)
		for (var j = 0; j < columns.length; j++) {
			if (isNaN(columns[j]))	{
				columns[j] = columns[j];
			} else {
				columns[j] = parseFloat(columns[j]);
			}
		}
		textAreaMatrix[textAreaMatrix.length] = columns;
	}
	return textAreaMatrix;
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
				var model = filestream.split(',')[1];
				model = atob(model); // from Base64 to text
				model = JSON.parse(model);
				if (model.network)	{
					myNetwork = Network.fromJSON(model.network);
				}
				if (model.inputMinMax)	{
					inputMinMax = model.inputMinMax;
				}
				if (model.outputMinMax)	{
					outputMinMax = model.outputMinMax;
				}
			};
		})(f);
		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	}
}

document.getElementById('files').addEventListener('change', loadNetworkFromJsonFile, false);
document.getElementById('minmaxinp').addEventListener('click', function () {
	inpmax = stringCSVtoMatrix('inpnotnorm');
	if (inputOneHotEncoding)	{
		inpmax = encodeOneHot(inpmax, inputOneHotEncoding)
	}
	inputMinMax=scaleData(inpmax,'inpnotnorm');
	document.querySelector('#netlen').value = inputMinMax.maxincolumn.length+','+document.querySelector('#netlen').value;
}, false);
document.getElementById('minmaxout').addEventListener('click', function () {
	outmatx = stringCSVtoMatrix('outnotnorm');
	if (outputOneHotEncoding)	{
		outmatx = encodeOneHot(outmatx, outputOneHotEncoding)
	}
	outputMinMax=scaleData(outmatx,'outnotnorm');
	document.querySelector('#netlen').value = document.querySelector('#netlen').value+','+outputMinMax.maxincolumn.length
}, false);

document.getElementById('onehotinp').addEventListener('click', function () {
	var elem = 'inpnotnorm';
	inputOneHotEncoding=oneHotData(stringCSVtoMatrix(elem),'inpnotnorm');
	document.querySelector('#netlen').value = inputOneHotEncoding.length+','+document.querySelector('#netlen').value
}, false);
document.getElementById('onehotout').addEventListener('click', function () {
	var elem = 'outnotnorm';
	outputOneHotEncoding=oneHotData(stringCSVtoMatrix(elem),'outnotnorm');
	document.querySelector('#netlen').value = document.querySelector('#netlen').value+','+outputOneHotEncoding.length
}, false);