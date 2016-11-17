var express = require('express');
var app = express();
var randomizer = require('../randomizer');

app.get("/randomizer/+*", function(req, res) {
	var seed = req.params[0];
	res.setHeader('Content-Type', 'text/xml');
	res.setHeader('Content-Disposition', 'attachment; filename="necrodancer.xml"');
	res.status(200);
	randomizer({seed: seed}).then(function(xml) {
		res.send(xml);
	});
});
app.listen(3007);