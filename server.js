/*
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(process.env.PORT || "8080");
*/

/*
var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('hello world express');
});

app.listen(process.env.PORT || "8080");
*/


var express = require("express")
    , RecordProvider = require("./recordprovider").RecordProvider;


var app = express();
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));
app.post('/', function(req, res){
    res.redirect(req.url);
});

var recordProvider = new RecordProvider(process.env.MONGOLAB_URI);



//Routes
app.get('/api', function (req, res) {
  res.send('anvaska API is running');
});
app.get('/api/records', function (req, res){
  recordProvider.findAll(function(error, data) {
     res.send(data);
  });
});

app.post('/api/records', function (req, res){
  var records = req.body.records;
  recordProvider.save(records, function(error, data) {
     res.send(data);
  });
});
app.delete('/api/records/:id', function (req, res){
  console.log(req.params.id);
  recordProvider.deleteById(req.params.id, function(error, result) {
     res.send(result);
  });  
});
app.listen(process.env.PORT || "8080");
/*



app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  //app.use(express.static(path.join(application_root, "public")));
});
*/
/*
app.listen(process.env.PORT || "8080");
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
*/
