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
async function learnBPP(net, inputs, outputs, loops = 20000, learningRate = 0.3){
	var history = [];

	var trainer = new Trainer(net);
	var trainingSet = [];
	var testSet = [];
	var validationSet = {'input':[],'output':[]};
	var trainingSetVal = {'input':[],'output':[]};
	var training_len = 0;
	var train_data_proportion = parseFloat(document.querySelector('#train_data_proportion').value);
	var validate_error = false;
	var validate_each = parseInt(document.querySelector('#test_count').value);
	var log_interval = parseInt(document.querySelector('#log_interval').value);
	var cost_function = document.querySelector('#const_function [selected]').value;
	if (inputs.length>100){
		training_len = parseInt(inputs.length*train_data_proportion);
	} else {
		training_len = inputs.length;
	}
	for(var i = 0; i < training_len; i++){
		trainingSet[trainingSet.length] = {'input':inputs[i],'output':outputs[i]};
		testSet[testSet.length] = {'input':inputs[i],'output':outputs[i]};
	}
	if (training_len != inputs.length) {
		validate_error = true;
		for(var i = training_len; i < inputs.length; i++){
			validationSet['input'][validationSet['input'].length] = inputs[i];
			validationSet['output'][validationSet['output'].length] = outputs[i];
		}
		for(var i = 0; i < training_len; i++){
			trainingSetVal['input'][trainingSetVal['input'].length] = inputs[i];
			trainingSetVal['output'][trainingSetVal['output'].length] = outputs[i];
		}
	} else {
		document.querySelector('.vcost').innerHTML = "Samples < 100.."
		document.querySelector('.tcost').innerHTML = "Samples < 100.."
	}
	// Async training
	document.querySelector('.iterations').innerHTML = 0;
	for (var i = 0; i < parseInt(validate_each); i++) {
		await trainer.trainAsync(trainingSet,{
			rate: learningRate,
			iterations: parseInt(loops/validate_each),
			error: .0001,
			log: 1000,
			cost: Trainer.cost[cost_function],
			schedule: {
				every: log_interval, // repeat this task every 500 iterations
				do: function(data) {
					// custom log
					var logstr = "Error: "+data.error+"| Iterations:"+data.iterations+"| Rate:"+data.rate;
					console.log("error", data.error, "iterations", data.iterations, "rate", data.rate);
					document.querySelector('.terror').innerHTML = data.error;
					document.querySelector('.iterations').innerHTML = parseInt(document.querySelector('.iterations').innerHTML)+log_interval;//data.iterations;
					if (data.error<0.00001)
						return true; // abort/stop training
					}
				}
		}).then(results => {
			//var test_error = trainer.test(testSet).error;
			document.querySelector('.test_error').innerHTML = trainer.test(testSet).error;
			var validation_error = 0;
			if (validate_error) {
				var validation_activation = []; 
				for (var i = 0; i < trainingSetVal['input'].length; i++) {
					validation_activation[validation_activation.length] = net.activate(trainingSetVal['input'][i]);
				}
				validation_error = Trainer.cost[cost_function](trainingSetVal['output'], validation_activation);
				document.querySelector('.tcost').innerHTML = validation_error;

				validation_activation = []; 
				for (var i = 0; i < validationSet['input'].length; i++) {
					validation_activation[validation_activation.length] = net.activate(validationSet['input'][i]);
				}
				validation_error = Trainer.cost[cost_function](validationSet['output'], validation_activation);
				document.querySelector('.vcost').innerHTML = validation_error;
			}
			console.log('done!', results);return history
		});

	}
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