var routes = require('routes')(),
fs = require('fs'),
db = require('monk')('localhost/moviereviews'),
movies = db.get('movies'),
qs = require('qs'),
view = require ('./view'),
mime = require ('mime');

routes.addRoute('/', function (req, res, url){
  res.setHeader('Content-Type', 'text/html')
  fs.readFile('./home.html', function (err,file){
    if (err) {
      res.setHeader('Content-Type', 'text/html');
      res.write('404')
    }
    res.end(file)
  })
})

routes.addRoute('/movies', function (req, res, url) {

  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    movies.find({}, function (err, docs){
      var template = view.render('/movies/index', {movies:docs})
      res.end(template)
    })
  }

  if (req.method === "POST") {
         var result = '';
         req.on('data', function (chunk) {
             result += chunk;
         });
         req.on('end', function () {
             var movie = qs.parse(result);
             movies.insert(movie, function (err, doc) {
                 if (err) {
                     res.end('error');
                 }
                 res.writeHead(302, {'Location': '/movies'});
                 res.end();

             })
         })
     }
 })


routes.addRoute('/movies/new', function (req, res, url) {
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        movies.find({}, function (err, docs) {
            var template = view.render('/movies/new', {movies:docs})
            res.end(template)
        })
    }
})



routes.addRoute('/movies/:id', function(req,res,url){
  if (req.method ==='GET'){
    res.setHeader('Content-Type', 'text/html')
    movies.findOne({_id:url}, function(err,docs){
      if(err) res.end('error')
      var template = view.render('/movies/show', {movies:docs})
      res.end(template)
    })
  }
})

routes.addRoute('/public/*', function(req,res,url){

  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('./' + req.url, function(err,file){
    if (err){
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
    res.end(file)
  })
})

routes.addRoute('/movies/:id/edit', function(req,res,url){
  url = url.params.id
  if (req.method ==='GET'){
    res.setHeader('Content-Type', 'text/html')
    movies.findOne({_id:url}, function(err,docs){
      if(err) res.end('error')
      var template = view.render('movies/edit', docs)
      res.end(template)
    })
  }
})

routes.addRoute('/movies/:id/delete', function(req,res,url){
  if (req.method ==='POST'){
    movies.remove({_id:url.params.id}, function (err, docs){
      if (err) res.end('error')
      res.writeHead(302, {'Location': '/movies'})
      res.end()
    })
  }
})

routes.addRoute('/movies/:id/udpate', function(req, res, url){
  var data = '';
  req.on('data', function(chuck){
    data += chunk;
  })
  req.on('end', function(){
    var movie = qs.parse(data);
    movies.update({_id: url.params.id}, {title: movie.title, director: movie.director, year: movie.year, rating: movie.rating, posterURL: movie.posterURL}, function (err,doc){
      res.writeHead(302, {'Location': '/movies'})
      res.end();
    })
  })
})


module.exports = routes;
