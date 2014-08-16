Fantasy Football HTML Scraper
=============================

A simple NodeJS application which mines all the data from the Premier League Fantasy Football statistics pages.

To run:

1. Ensure you have NodeJS installed.
1. Clone this repository to your local machine.
1. Open a terminal and navigate to your local copy.
1. Run 'npm install'
1. Run 'npm start'
1. The scraped data will saved as JSON to a folder within your local copy.

Limitations
-----------
* Currently we will blindly pull down the first 10 pages of each statistic. This is hardcoded and maybe changed in future versions.
* The results are not sorted.
* Output directory cannot be specified.
* Previous data from the same day will be overwritten.