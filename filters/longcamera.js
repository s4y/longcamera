importScripts('/figue.js');

var buffer = [];
var finalImage;

self.addEventListener('message', function(e){
	var counter,
	    clusters,
		pixelData;
	if (!finalImage) {
		finalImage = e.data.imageData;
		self.postMessage({ name: 'readyForFrame' });
		return;
	}
	buffer.push(e.data.imageData);
	if (buffer.length > 20){
		buffer.shift();
	} else if (buffer.length < 20){
		self.postMessage({ name: 'readyForFrame' });
		return;
	}
	// var scores = scoreCtx.createImageData(200, 200);
	for (var i = 0, l = finalImage.data.length; i < l; i += 4) {
		pixelData = []
		for (var frame = 0, totalFrames = buffer.length; frame < totalFrames; frame++){
			r = buffer[frame].data[i];
			g = buffer[frame].data[i+1];
			b = buffer[frame].data[i+2];
			pixelData.push([r, g, b]);
		}
		var max = 0;
		var candidate;
		var centroid;
		counter = {};
		clusters = figue.kmeans(2, pixelData);
		if (clusters){
			clusters.assignments.forEach(function(category){
				if (category in counter){
					counter[category]++;
					if (max < counter[category]){
						max = counter[category];
						candidate = category;
					}
				} else {
					counter[category] = 1;
				}
			});
			centroid = clusters.centroids[candidate];
		} else {
			centroid = pixelData[pixelData.length-1];

		}

		finalImage.data[i] = Math.floor(centroid[0] + .5);
		finalImage.data[i+1] = Math.floor(centroid[1] + .5);
		finalImage.data[i+2] = Math.floor(centroid[2] + .5);
		// Just do this once for the alpha channel?
		finalImage.data[i+3] = 255;
	}
	self.postMessage({ name: 'outputFrame', imageData: finalImage });
	self.postMessage({ name: 'readyForFrame' });
	// scoreCtx.putImageData(scores, 0, 0);
});
