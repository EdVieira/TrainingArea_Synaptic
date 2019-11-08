
function oneHotData(elem, target) {
	console.log('oneHotdata('+elem+','+target+')');

	//var res = getMatrix(elem);
	//var dtx = "datamatrix = "+res+";";
	var datamatrix = stringCSVtoMatrix(elem);

	var target_cols = prompt('Wich columns?\nFor choosing the first and the second column, e.g.:\n0,1');
	target_cols = target_cols.trim().split(/,/g)
	for (var i = 0; i < target_cols.length; i++) {
		target_cols[i] = parseInt(target_cols[i]);
	}
	//appendBody('script', dtx);
	var oneHotEncoder = fitOneHotEncoder(datamatrix, target_cols);
	oneHotEncoder.length = datamatrix[0].length + oneHotEncoder.colCount() - 1;
	// Encode the data
	datamatrix = encodeOneHot(datamatrix, oneHotEncoder)
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
	}
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

			dtMatrix[i].splice(j,1); // remove old column
			encoder.columnIndex[j].newColumns[0] =  encoder.columnIndex[j].values.length - dtMatrix[i].length;
			encoder.columnIndex[j].newColumns[1] =  dtMatrix[i].length;
		}
	}
	return dtMatrix;
}
/*
function decodeOneHot(vector, encoder)	{
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

			dtMatrix[i].splice(j,1); // remove old column
			encoder.columnIndex[j].newColumns[0] =  encoder.columnIndex[j].values.length - dtMatrix[i].length;
			encoder.columnIndex[j].newColumns[1] =  dtMatrix[i].length;
		}
	}
	return dtMatrix;
}*/