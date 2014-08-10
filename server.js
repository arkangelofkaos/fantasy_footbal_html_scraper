var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
	
	url = 'http://fantasy.premierleague.com/stats/elements/?element_filter=0&stat_filter=total_points';

	request(url, function(error, response, html){
		if(!error){
			var $page = cheerio.load(html);

			var title, release, rating;
			var json = {};

			$page('.ismTable tbody tr').filter(function(){
		        var $row = $page(this);
		        var name = $row.find(':nth-child(3)').text();
		        json[name] = {
		             selectedBy : $row.find(':nth-child(6)').text(),
                     price: $row.find(':nth-child(7)').text(),
                     gameWeekScore: $row.find(':nth-child(8)').text(),
                     totalScore: $row.find(':nth-child(9)').text()
		        };
	        })
		}
        // To write to the system we will use the built in 'fs' library.
        // In this example we will pass 3 parameters to the writeFile function
        // Parameter 1 :  output.json - this is what the created filename will be called
        // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
        // Parameter 3 :  callback function - a callback function to let us know the status of our function

        fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
        	console.log('File successfully written! - Check your project directory for the output.json file');
        })

        // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
        res.send('Check your console!')
	})
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;