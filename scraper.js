"use strict";
/* jslint node: true */

var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs');

function extractListings(html) {
  /* Given a page of WeGotTickets.com event listing page html,
    extract each event into a JSON file */

  var $ = cheerio.load(html);
  $('.ListingOuter').each(function(){
    var title = $(this).find('.ListingAct h3 .event_link').text();
    var venueTitle = $(this).find('.ListingAct .venuename').text();
    var city = $(this).find('.ListingAct .venuetown').text().replace(': ', '');
    var date = $(this).find('.ListingAct blockquote p').html().split("<br>")[1];
    var price = $(this).find('.ListingPrices .searchResultsPrice strong').text();
    var sourceUrl = $(this).find('.ListingAct a.event_link').attr('href');
    var id = sourceUrl.split('/').pop();
    var scrapedDatetime = Date.now();

    var eventListing = {
      id: id,
      title: title,
      venueTitle: venueTitle,
      city: city,
      date: date,
      price: price,
      sourceUrl: sourceUrl,
      scrapedDatetime: scrapedDatetime,
    };
    // console.log(eventListing);

    var fileLocation = 'listing_data/' + id + '.json';
    fs.writeFile(
      fileLocation,
      JSON.stringify(eventListing, null, 4),
      function(err){
        if (!err) {
          console.log('Event: \"' + title +
            '\" successfully written to ' + fileLocation);
        } else {
          console.log(err);
        }
      }
    );
  });
}


function scrapeWeGotTickets(pageLimits) {
  /* Request WeGotTickets.com's event listing pages to be scraped.
     page_limits is a two element array of the first and last 
     page to scrape */

  pageLimits = pageLimits || [1, 1000];
  var page = pageLimits[0];
  var finalPage = pageLimits[1];
  console.log("### Scraping WeGotTickets.com listing pages " +
    page + " to " + finalPage);

  var baseUrl = 'http://www.wegottickets.com/searchresults/page/';
  var pauseBetweenRequests = 1000; //ms

  function loadPage(page) {
    var url = baseUrl + page + '/all';
    console.log("\nRequesting: " + url);
    request(url, function(error, response, html){
      if(!error && response.statusCode === 200){
        extractListings(html);
        setTimeout(function() {
          page += 1;
          if (page <= finalPage) {
            loadPage(page);
          }
        }, pauseBetweenRequests);
      }
      else {return error;}
    });
  }
  loadPage(page);
}

var pageLimits = [1,3];
scrapeWeGotTickets(pageLimits);

// Define functions available as a node module
module.exports = scrapeWeGotTickets;
