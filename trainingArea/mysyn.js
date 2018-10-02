const {Neuron, Layer, Network, Trainer} = window.synaptic;


// return a new network
function newNetwork(lengths, forwardfull_connected = false){

	// creates the layers
	var layers = [];
	for (var i = 0; i < lengths.length; i++)  {
		var auxLayer = new Layer(lengths[i]); // layer length
		layers.push(auxLayer); // add array element (append)
	}

	// communicates the layers (feedfoward)
	for (var i = 0; i < layers.length - 1; i++)  {
		/*layers[i].neurons().forEach( (item) => {
				console.log(item);
				item.squash = Neuron.squash.SINUSOID;
				console.log(item);
			});*/
		if (forwardfull_connected){
			for (var j = 0; j <= i; j++)  {
				layers[j].project(layers[i+1], Layer.connectionType.ALL_TO_ALL);
				layers[j].set({
					squash: Neuron.squash.SINUSOID,
					bias: 0
				});
			}
		}else{
			layers[i].project(layers[i+1], Layer.connectionType.ALL_TO_ALL);
			layers[i].set({
				squash: Neuron.squash.SINUSOID,
				bias: 0
			});
		}
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
	var history = [];

	var trainer = new Trainer(net);
	var trainingSet = [];
	for(var i = 0; i < inputs.length; i++){
		trainingSet[trainingSet.length] = {'input':inputs[i],'output':outputs[i]};
	}
	// Async training
	trainer.trainAsync(trainingSet,{
		rate: learningRate,
		iterations: loops,
		error: .0001,
		log: 1000,
		cost: Trainer.cost.CROSS_ENTROPY,
		schedule: {
			every: 500, // repeat this task every 500 iterations
			do: function(data) {
				// custom log
				console.log("error", data.error, "iterations", data.iterations, "rate", data.rate);
				if (data.error<0.00001)
					return true; // abort/stop training
				}
			}
	}).then(results => {console.log('done!', results);return history});
	/*
	// Backpropagation__
	// iterates over the loops counting
	for (var i = 0; i < loops; i++) {
		history[history.length] = []
		// iterates over the amount of inputs given to the network
		for (var j = 0; j <  inputs.length; j++) {
			// activates the network
			var aux = net.activate(inputs[j]);
			// history of: obtained vs desired
			history[history.length-1].push([inputs[j], aux, outputs[j]]);
			// backpropagates the error
			net.propagate(learningRate, outputs[j]);	
		}
		if(i%10000 == 0){
			console.log(history[history.length-1]);
		}
		//history = [];
	}
	*/
	//return history;
}