var application_root = __dirname,
    express = require("express"),
    path = require("path");

var app = express.createServer();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
});
app.get('/api', function (req, res) {
  res.send('anvaska API is running');
});
app.get('/api/records', function (req, res){
  res.redirect('/sample.json');
});
app.post('/api/records', function (req, res){
  var record = "";
  console.log("/api/records POST has been invoked");
  res.send("hello from post");
});
app.listen(process.env.PORT || "8080");