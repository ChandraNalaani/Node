
/**
 * Module dependencies.
 */

var express = require('express')
	, jsdom = require('jsdom')
	, request = require('request')
	, url = require('url')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, path = require('path');

var app = express();
var server = http.createServer(app);

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, '../public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/scrape', function(req, res){
	// Fetch youtube.com, send results to callback func
    request({
    	uri: 'http://youtube.com'
    }, function(err, response, body){
        var self = this;
		self.items = new Array(); // Save results in array
		
		// Error check
        if(err && response.statusCode !== 200){
        	console.log('Request error.');
        }

        // Send body param as HTML to be parsed in jsdom
      	// Tell jsdom to attach jQuery
		jsdom.env({
            html: body,
            scripts: ['http://codeorigin.jquery.com/jquery-1.10.2.min.js'],
            done: function(err, window){
				// Use jQuery just as in a reg HTML page
                    var $ = window.jQuery
                    	, $body = $('div #page-container #content')
                        , $videos = $body.find('.lohp-category-shelf-item');

                    $videos.each(function(i, item){
						var $a = $(item).children('a'),
						$title = $(item).find('.lohp-video-link').text(),
						$img = $a.find('span.video-thumb img');
						
						// Add all data to items array
                        self.items[i] = { 
							href: $a.attr('href'),
							title: $title.trim(),
							thumbnail: $img.attr('data-thumb') ? $img.attr('data-thumb') : $img.attr('src'),
							urlObj: url.parse($a.attr('href'), true) //parse our URL and the query string as well
						};
                    });
					
						// Build views
						res.render('list', {
                     		title: 'Scrape',
							items: self.items
                    	});
	        	}
			});
		});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
