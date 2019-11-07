function scaleData(elem, target) {
	console.log('scaledata('+elem+','+target+')');

	//var res = getMatrix(elem);
	//var dtx = "datamatrix = "+res+";";
	var datamatrix = stringCSVtoMatrix(elem);

	//appendBody('script', dtx);
	var minMaxScaler = fitMinMaxScaler(datamatrix);
	// Scale the data
	/*
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
	}*/
	alert('minMaxScaler fitted!');
	return minMaxScaler;
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
