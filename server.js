var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var $s = require('string');
var moment = require('moment');
var extend = require('extend');
var _ = require('underscore');
var app = express();

const apiTemplate = 'http://fantasy.premierleague.com/stats/elements/'
                  + '?element_filter={{elementFilter}}'
                  + '&stat_filter={{statFilter}}'
                  + '&page={{page}}';

function scrapeFantasyFootballData(url, callback) {
    var json = {};

    request(url, function(error, response, html){
		if(!error){
			var $page = cheerio.load(html);

			var title, release, rating;

			function rowMapper($row) {
                return {
                    selectedBy : $row.find(':nth-child(6)').text(),
                    price: $row.find(':nth-child(7)').text(),
                    gameWeekScore: $row.find(':nth-child(8)').text(),
                    totalScore: $row.find(':nth-child(9)').text()
                }
            };

			$page('.ismTable tbody tr').filter(function(){
		        var $row = $page(this);
		        var name = $row.find(':nth-child(3)').text();
		        json[name] = rowMapper($row);
	        });

	        callback(json);
		}
	});
};

app.get('/scrape', function(req, res){
    var args = {elementFilter: '0', statFilter: 'total_points', page: 1};
	totalPointsPage1Url = $s(apiTemplate).template(args).s;
	args['page'] = 2;
	totalPointsPage2Url = $s(apiTemplate).template(args).s;

	var outputFileName = args.statFilter + '_' + moment().format('YYYY-MM-DD') + '.json';
	var completeResult = {};
	saveResult = _.after(2, function () {
        var humanReadableJson = JSON.stringify(completeResult, null, 4);
        fs.appendFile(outputFileName, humanReadableJson, function(err){
            console.log('File successfully written! - Check your project directory for the '+outputFileName+' file');
        });
    });

    scrapeFantasyFootballData(totalPointsPage1Url, function (json) {
        extend(completeResult, json);
        saveResult();
    });
    scrapeFantasyFootballData(totalPointsPage2Url, function (json) {
        extend(completeResult, json);
        saveResult();
    });

    // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
    res.send('Processing...')
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;