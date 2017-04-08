var express = require('express');
var app = express();
var randomizer = require('../randomizer');

app.get("/randomizer/:seed/:amplified", function(req, res) {
	var seed = req.params.seed,
		original = !req.params.amplified;
	res.setHeader('Content-Type', 'text/xml');
	res.setHeader('Content-Disposition', 'attachment; filename="necrodancer.xml"');
	res.status(200);
	randomizer({seed: seed == 'random' ? '' : seed, original: original }).then(function(xml) {
		res.send(xml);
	});
});
app.listen(3007);