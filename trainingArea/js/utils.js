
var net;
var learning_history;
var myNetwork = null;

function reset() {
	document.querySelector('.error').innerHTML = '0.0';
	document.querySelector('.iterations').innerHTML = '0.0';
	document.querySelector('.rate').innerHTML = '0.0';
	myNetwork = null;
}

function learn(){
console.log('learn()');
	// get attributes
	netlen = "netlen = ["+document.getElementById('netlen').value+"];";
	loops = "loops = "+document.getElementById('loops').value+";";
	rate = "rate = "+document.getElementById('rate').value+";";
	var res = document.getElementById('inpmatx').value.trim().replace(/\n/g, "],[");
	inpmatx = "inpmatx = [["+res+"]];";
	var res = document.getElementById('outmatx').value.trim().replace(/\n/g, "],[");
	outmatx = "outmatx = [["+res+"]];";
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
	return myNetwork;
}

function tryit(n){
	console.log('tryit('+n+')');
	var tryit_act =  "try_val = ["+document.getElementById('tryit').value+"];";
	appendBody('script', tryit_act);

	var res = n.activate(try_val);
	console.log(try_val);
	console.log(res);
	document.getElementById('res').value = res;
}

	function normalizedata(elem, target) {
	console.log('normalizedata('+elem+','+target+')');
	elem = document.getElementById(elem).value;
	var res = elem.replace(/\n/g, "],[");
	var dtx = "datamatrix = [["+res+"]];";
	appendBody('script', dtx);
	var maxincolumn = [];
	for (var i = 0; i < datamatrix[0].length; i++){
		maxincolumn.push(datamatrix[0][i]);
	}
	var minincolumn = [];
	for (var i = 0; i < datamatrix[0].length; i++){
		minincolumn.push(datamatrix[0][i]);
	}

	for (var i = 0; i < datamatrix.length; i++) {
		for (var j = 0; j < datamatrix[0].length; j++) {
			if(datamatrix[i][j] > maxincolumn[j]) {
				// Max value from each column
				maxincolumn[j] = datamatrix[i][j];
			}
			if(datamatrix[i][j] < minincolumn[j]) {
				// Min value from each column
				minincolumn[j] = datamatrix[i][j];
			}
		}
	}
	// Normalize the data
	for (var i = 0; i < datamatrix.length; i++) {
		for (var j = 0; j < datamatrix[i].length; j++) {
			xi = datamatrix[i][j];
			datamatrix[i][j] = (xi - minincolumn[j])/(maxincolumn[j]-minincolumn[j]);
		}
	}
	// Write into target textarea
	document.getElementById(target).value = "";
	for (var i = 0; i < datamatrix.length; i++) {
		if (i != 0) {
			document.getElementById(target).value += "\n";
		} 
		for (var j = 0; j < datamatrix[i].length; j++) {
			document.getElementById(target).value += datamatrix[i][j];
			if (j < datamatrix[i].length-1){
				document.getElementById(target).value += ",";
			}
			//xi = datamatrix[i][j];
			//datamatrix[i][j] = (xi - minincolumn[j])/(maxincolumn[j]-minincolumn[j]);
		}
	}
}

function appendBody(elem, content) {
	console.log('appendBody('+elem+','+content+')');
	var node = document.createElement(elem);
	var textnode = document.createTextNode(content);
	node.appendChild(textnode);
	document.body.appendChild(node);
}