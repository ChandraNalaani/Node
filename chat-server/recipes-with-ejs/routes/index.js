
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.recipes = function(req, res){
  res.render('index', { title: 'Recipes' });
};