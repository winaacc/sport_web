var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var comression = require('compression');
//socket.io
var server = require('http').Server(app);
var io = require('socket.io')(server);

var router = require("./src/router")
var realtime = require("./src/realtime")

app.use(comression());
app.use(express.static('public'));
app.use(bodyParser.json({limit:'50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({ limit:'50mb',extended: true })); // for parsing application/x-www-form-urlencoded

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json");
    next();
});

server.listen(80);

router.init(app);
realtime.init(io);

app.get('/',function(req,res){	
	res.sendFile(__dirname+'/public/index.html')
})

/*var server = app.listen(80,function(){
	var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
})*/