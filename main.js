"use strict";

const URL_START = "http://www.omdbapi.com/?s=";

var PAGES_ARRAY = [];


$(document).ready( function(){

	$('#search-form').on('submit',function(e){
		e.preventDefault();	

		$('#search-button').text('Loading...');

		var searchTitle = $('#title-field').val();
		var searchYear  = $('#year-field').val();
		var searchType  = $('#type-field').val();
		var searchURL = formatSearch(searchTitle,searchType,searchYear);

		getPageOfResults(1,searchURL);

	});
});


function Result(type, title, year, genre, plot, imdb, starring){
	this.type = type;
	this.title = title;
	this.year = year;
	this.genre = genre;
	this.plot = plot;
	this.starring = starring;
	this.imdb = "http://www.imdb.com/title/" + imdb;
}
Object.defineProperty(Result.prototype,'$element', {get: get$element });

function get$element (){					
	var $resultElementToAdd = $('#result-template').clone();
	$resultElementToAdd.removeAttr('id','result-template');
	$resultElementToAdd.find('.title').text(this.title);
	$resultElementToAdd.find('.title').attr('href',this.imdb);
	$resultElementToAdd.find('.year').text("(" + this.year + ")");
	$resultElementToAdd.find('.starring').text("Starring " + this.starring);
	$resultElementToAdd.find('.plot').text(this.plot);
	$resultElementToAdd.find('.genre').text(this.genre);
	return $resultElementToAdd;
}


function formatSearch(titleToGet,typeToGet,yearToGet) {

	var urlToReturn = URL_START + titleToGet.replace(/\s/g, "+");

	if (typeToGet)
		urlToReturn += "&type=" + typeToGet;

	if (yearToGet)
		urlToReturn += "&y=" + yearToGet;

	return urlToReturn + "&plot=full";
}



function getPageOfResults(pageToGet,searchTerm) {

	$.ajax(searchTerm + "&page=" + pageToGet, {
		success: function(data) {

			if( data.Response != "False"){
				var $resultsArea = $('#results-area');
				var $resultsToAppend = [];
				var pageArray = []; 

				for (var i = 0; i < data.Search.length; i++){
					var oldTitle = data.Search[i].Title;
					$.ajax("http://www.omdbapi.com/?t=" + oldTitle, {
						success: function(data) {
							var title = data.Title;
							var year = data.Year;
							var imdb = data.imdbID;
							var genre = data.Genre;
							var plot = data.Plot;
							var type = data.Type;
							var starring = data.Actors;
							var resultToAdd = new Result(type, title, year, genre, plot, imdb, starring);

							$resultsToAppend.push(resultToAdd.$element);
							pageArray.push(resultToAdd);

							if ($resultsToAppend.length >= 10){
								PAGES_ARRAY = [];
								$resultsArea.empty();
								$resultsArea.append(...$resultsToAppend);
								$('#search-button').text('Search!');
								if (!PAGES_ARRAY[pageToGet - 1])
									PAGES_ARRAY[pageToGet - 1] = pageArray;
							}
						},
					});
				};
			}
			else {
				$('#no-results-alert').show().delay(1000).fadeOut(1000);
				$('#search-button').text('Search!');
			}
		}
	});
}




