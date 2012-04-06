var buffer = [];
var finalImage;

self.addEventListener('message', function(e){
	if (!finalImage) {
		finalImage = e.data.imageData;
		self.postMessage({ name: 'readyForFrame' });
		return;
	}
	buffer.push(e.data.imageData);
	if (buffer.length > 20){
		buffer.shift();
	}
	// var scores = scoreCtx.createImageData(200, 200);
	for (var i = buffer[0].data.length - 1; i >= 0; i--) {
		var counter = {};
		var max = 0;
		var candidate = 0;
		for (var frame = 0, totalFrames = buffer.length; frame < totalFrames; frame++){
			var value = buffer[frame].data[i];
			if (value in counter){
				counter[value]++;
			} else {
				counter[value] = 1;
			}
			if (counter[value] > max){
				max = counter[value];
				candidate = value;
			}
		}
		finalImage.data[i] = candidate;
		// scores.data[i] = max * 255 / buffer.length;
	}
	self.postMessage({ name: 'outputFrame', imageData: finalImage });
	self.postMessage({ name: 'readyForFrame' });
	// scoreCtx.putImageData(scores, 0, 0);
});

self.postMessage({ name: 'readyForFrame' });
