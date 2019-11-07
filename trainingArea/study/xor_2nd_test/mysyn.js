const { Layer, Network } = window.synaptic;


// return a new network
function newNetwork(lengths){

	// creates the layers
	var layers = [];
	for (var i = 0; i < lengths.length; i++)  {
		var auxLayer = new Layer(lengths[i]); // layer length
		layers.push(auxLayer); // add array element (append)
	}

	// communicates the layers (feedfoward)
	for (var i = 0; i < layers.length - 1; i++)  {
		layers[i].project(layers[i+1]);
	}

	// gets the input layer from layers array
	var inputLayer = layers[0];

	// gets the hidden layers from layers array
	var hiddenLayer = [];
	for (var i = 1; i < layers.length-1; i++)  {
		hiddenLayer.push(layers[i])
	}

	// gets the output layer from the layers array
	var outputLayer = layers[layers.length-1];

	// creates the network
	var net = new Network({
	 input: inputLayer,
	 hidden: hiddenLayer,
	 output: outputLayer
	});
	return net
}

// train the network
function learnBPP(net, inputs, outputs, loops = 20000, learningRate = 0.3){
	// iterates over the loops counting
	for (var i = 0; i < loops; i++) {
		// iterates over the amount of inputs given to the network
		for (var j = 0; j <  inputs.length; j++) {
			// activates the network
			net.activate(inputs[j]);
			// backpropagates the error
			net.propagate(learningRate, outputs[j]);	
		}
	}
}