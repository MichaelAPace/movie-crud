var mustache = require('mustache');
var fs = require('fs');
var view = {
   render: function(url, data){
       var file = fs.readFileSync('templates/' + url + '.html');
       return mustache.render(file.toString(), data)

   }
};
module.exports = view;
