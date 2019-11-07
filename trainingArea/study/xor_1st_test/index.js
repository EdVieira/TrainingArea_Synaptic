//https://medium.freecodecamp.org/how-to-create-a-neural-network-in-javascript-in-only-30-lines-of-code-343dafc50d49

const { Layer, Network } = window.synaptic;

// makes layers
var inputLayer = new Layer(2); // input has 2 neurons
var hiddenLayer = new Layer(3); // hidden has 3 neurons
var outputLayer = new Layer(1); // output has 1 neuron


// communicate the layers
inputLayer.project(hiddenLayer); // from input to hidden
hiddenLayer.project(outputLayer); // from hidden to output


// makes the network
var myNetwork = new Network({
 input: inputLayer,
 hidden: [hiddenLayer],
 output: outputLayer
});


// train the network - learn XOR
var learningRate = .3;
for (var i = 0; i < 20000; i++) {
  // 0,0 => 0
  myNetwork.activate([0,0]);
  myNetwork.propagate(learningRate, [0]);
  // 0,1 => 1
  myNetwork.activate([0,1]);
  myNetwork.propagate(learningRate, [1]);
  // 1,0 => 1
  myNetwork.activate([1,0]);
  myNetwork.propagate(learningRate, [1]);
  // 1,1 => 0
  myNetwork.activate([1,1]);
  myNetwork.propagate(learningRate, [0]);
}
