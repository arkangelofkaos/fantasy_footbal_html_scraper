var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var $s = require('string');
var moment = require('moment');
var extend = require('extend');
var _ = require('underscore');

function calculateHeaders($page) {
    var columnHeaders = {};
    $page('#ism .ismTable thead tr th').each(function(index, element){
        var columnHeader = $page(element).text();
        if (columnHeader) columnHeaders[columnHeader] = index + 1;
    });
    return columnHeaders;
}

function rowMapper($row, columnHeaderToNumberMap) {
    var jsonNode = {};
    _.pairs(columnHeaderToNumberMap).forEach(function(pair){
        var key = pair[0];
        var columnNumber = pair[1];
        jsonNode[key] = $row.find(':nth-child(' + columnNumber + ')').text();
    });
    return jsonNode;
};

function extractPlayerInformation($page, columnHeaderToNumberMap) {
    var json = {};
    $page('.ismTable tbody tr').filter(function(){
        var $row = $page(this);
        var name = $row.find(':nth-child(3)').text() + '-' + $row.find(':nth-child(4)').text();
        json[name] = rowMapper($row, columnHeaderToNumberMap);
    });
    return json;
}

function scrapeDataFromUrlToJson(url, callback) {
    request(url, function(error, response, html){
		if(!error){
			var $page = cheerio.load(html);
            var columnHeaderToNumberMap = calculateHeaders($page);
            var json = extractPlayerInformation($page, columnHeaderToNumberMap);
	        callback(json);
		}
	});
};

function persist(stat, result) {
    return function() {
        var humanReadableJson = JSON.stringify(result, null, 4);
        var dateNow = moment().format('YYYY-MM-DD');
        var directory = dateNow + '-data/';
        var outputFileName = stat + '_' + dateNow + '.json';

        var outputPath = directory + outputFileName;
        fs.mkdir(directory, function(err) {
            // ignore errors
        });
        fs.writeFile(outputPath, humanReadableJson, function(err){
            if (err) {
                console.error(err);
            } else {
                console.log('File successfully written! - Check your project directory for the ' + outputPath + ' file');
            }
        });
    }
};

const apiTemplate = 'http://fantasy.premierleague.com/stats/elements/'
                  + '?element_filter={{elementFilter}}'
                  + '&stat_filter={{statFilter}}'
                  + '&page={{page}}';

function downloadFantasyFootballData(stat, numberOfDataPages) {
    const completeResult = {};
    const saveResult = _.after(numberOfDataPages, persist(stat, completeResult));

    for (pageNumber = 1; pageNumber <= numberOfDataPages; pageNumber++) {
        var args = {elementFilter: '0', statFilter: stat, page: pageNumber};
    	url = $s(apiTemplate).template(args).s;
        scrapeDataFromUrlToJson(url, function (json) {
            extend(completeResult, json);
            saveResult();
        });
    }
}

const stats = [
    'total_points', 'event_points', 'now_cost', 'selected_by_percent', 'minutes',
    'goals_scored', 'assists', 'clean_sheets', 'goals_conceded', 'own_goals',
    'penalties_saved', 'penalties_missed', 'yellow_cards', 'red_cards', 'saves',
    'bonus', 'ea_index', 'bps', 'form', 'dreamteam_count', 'value_form', 'value_season',
    'points_per_game', 'transfers_in', 'transfers_out', 'transfers_in_event', 'transfers_out_event',
    'cost_change_start', 'cost_change_start_fall', 'cost_change_event', 'cost_change_event_fall'
];

var numberOfDataPages = 10;
function scrape() {
    _.each(stats, function(stat) {
        downloadFantasyFootballData(stat, numberOfDataPages);
    });
};

console.log('Scraping Fantasy Football data...');
scrape();
