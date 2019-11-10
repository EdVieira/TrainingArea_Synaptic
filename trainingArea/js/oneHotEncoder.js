
function oneHotData(datamatrix, target) {
	//console.log('oneHotdata('+elem+','+target+')');

	//var res = getMatrix(elem);
	//var dtx = "datamatrix = "+res+";";
	//var datamatrix = stringCSVtoMatrix(elem);

	var target_cols = prompt('Wich columns?\nFor choosing the first and the second column, e.g.:\n0,1');
	target_cols = target_cols.trim().split(/,/g)
	for (var i = 0; i < target_cols.length; i++) {
		target_cols[i] = parseInt(target_cols[i]);
	}
	//appendBody('script', dtx);
	var oneHotEncoder = fitOneHotEncoder(datamatrix, target_cols);
	// Encode the data
	datamatrix = encodeOneHot(datamatrix, oneHotEncoder)
	oneHotEncoder.length = datamatrix[0].length;
	// Write into target textarea
	/*
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
	alert('One Hot Encoding fitted!')
	return oneHotEncoder;
}

function fitOneHotEncoder(dtMatrix, target_cols=[1,2])	{
	var encoder = getDistinctByColumns(dtMatrix, target_cols);
	encoder.colCount = function()	{
		var counter = 0;
		for (i in this.columnIndex){
			for (j = 0; j < this.columnIndex[i].values.length; j++){
				counter++;
			}
		}
		return counter;
	};
	encoder.indexAsArray = function()	{
		var indexes = [];
		for (i in this.columnIndex){
			indexes.push(parseInt(i));
		}
		return indexes;
	};
	return encoder
}

function getDistinctByColumns(dtMatrix, target_cols=[1,2])	{
	var distinctByColumn = {};
	distinctByColumn.columnIndex = {}
	distinctByColumn.removedIndexes = 0;
	for (var i = 0; i < dtMatrix[0].length; i++){
		if (target_cols.includes(i)) {
			distinctByColumn.columnIndex[i] = {"values":[],"newColumns":{}};
			distinctByColumn.removedIndexes++;
		}
	}
	distinctByColumn.originalCol = dtMatrix[0].length;
	for (var i = 0; i < dtMatrix.length; i++) {
		for (var j = 0; j < dtMatrix[0].length; j++) {
			if ((j in distinctByColumn.columnIndex) && !distinctByColumn.columnIndex[j].values.includes(dtMatrix[i][j])) {
				// Max value from each column
				distinctByColumn.columnIndex[j].values.push(dtMatrix[i][j]);
			}
		}
	}
	return distinctByColumn;	
}
	
function encodeOneHot(dtMatrix, encoder)	{
	for (var i = 0; i < dtMatrix.length; i++) {
		for (var j in encoder.columnIndex) {
			j = parseInt(j);
			var columnValue = dtMatrix[i][j];
			for (var k = 0; k < encoder.columnIndex[j].values.length; k++){
				//var indexTrue = encoder.columnIndex[j].indexOf(columnValue)
				if(columnValue == encoder.columnIndex[j].values[k]){
					dtMatrix[i].push(1);
				} else{
					dtMatrix[i].push(0);
				}
			}
		}
	}
	for (var i = 0; i < dtMatrix.length; i++) {
		var removeCounter = 0;
		for (var j in encoder.columnIndex) {
			j = parseInt(j);
			dtMatrix[i].splice(j - removeCounter ,1); // remove old column
			encoder.columnIndex[j].newColumns[0] =  encoder.columnIndex[j].values.length - dtMatrix[i].length;
			encoder.columnIndex[j].newColumns[1] =  dtMatrix[i].length;
			removeCounter++;
		}
	}
	return dtMatrix;
}

function decodeOneHot(vector, encoder)	{
	var columns = encoder.columnIndex;
	var startSlice = vector.length - encoder.colCount();
	var defaultSlice = vector.slice(0,startSlice);
	var oneHotSlice = vector.slice(startSlice);
	var lastSlice = 0;
	for (var j in columns) {
		j = parseInt(j);
		var sliceTill = columns[j].values.length+lastSlice;
		columns[j].results = oneHotSlice.slice(lastSlice, sliceTill);
		lastSlice += columns[j].values.length;
		// Lets get the label
		var predictedIndex = 0;
		for (var k in columns[j].results)	{
			if (columns[j].results[k] > columns[j].results[predictedIndex])	{
				predictedIndex = parseInt(k);
			}
		}
		console.log(columns[j].results);
		console.log(predictedIndex);
		// Here we have our label to apply in the column!!
		columns[j].predicted = columns[j].values[predictedIndex];
		var left = defaultSlice.slice(0,j);
		var right = defaultSlice.slice(j);
		left.push(columns[j].predicted);
		defaultSlice = left.concat(right);
		//defaultSlice.push(columns[j].predicted);
	}

	return defaultSlice;
}