var finalImage, counts;

var threshold = 30, patience = 50;

self.addEventListener('message', function(e){
	var r, g, b, distance, inputData = e.data.imageData.data;
	if (!finalImage) {
		finalImage = e.data.imageData;
		counts = new Uint8Array(finalImage.data.length / 4);
		self.postMessage({ name: 'readyForFrame' });
		return;
	}
	// var scores = scoreCtx.createImageData(200, 200);
	for (var i = 0, l = inputData.length; i < l; i++) {
		distance = 0;
		r = inputData[i];
		distance += Math.abs(r - finalImage.data[i++]);
		g = inputData[i];
		distance += Math.abs(g - finalImage.data[i++]);
		b = inputData[i];
		distance += Math.abs(b - finalImage.data[i++]);
		// Just do this once for the alpha channel?
		finalImage.data[i] = inputData[i];
		if (distance < threshold) {
			counts[i - 3 / 4] = 0;
		} else if (++counts[i - 3 / 4] > patience) {
			finalImage.data[i-3] = r;
			finalImage.data[i-2] = g;
			finalImage.data[i-1] = b;
			counts[i - 3 / 4] = 0;
		}
	}
	self.postMessage({ name: 'outputFrame', imageData: finalImage });
	self.postMessage({ name: 'readyForFrame' });
	// scoreCtx.putImageData(scores, 0, 0);
});

self.postMessage({ name: 'readyForFrame' });
