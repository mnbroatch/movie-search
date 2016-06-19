const URL_START = "http://www.omdbapi.com/?s=";

var CURRENT_PAGE = 1;
var PAGES_ARRAY = [];


$(document).ready( function(){

	var searchURL;

	$('#search-form').on('submit',function(e){
		e.preventDefault();	

		$('nav').css('display','none');

		$('#search-button').text('Loading...');

		CURRENT_PAGE = 1;
		var searchTitle = $('#title-field').val();
		var searchYear  = $('#year-field').val();
		var searchType  = $('#type-field').val();
		searchURL = formatSearch(searchTitle,searchType,searchYear);

		getPageOfResults(CURRENT_PAGE,searchURL);

	});


	$('.pagination').on('click','a',function(e){
		e.preventDefault();
		if (e.currentTarget.className == "previous-button"){
			if (CURRENT_PAGE > 1){
				CURRENT_PAGE--;
			}
			else return;
		}
		else if (e.currentTarget.className == "next-button"){
			if (CURRENT_PAGE < $('.number-button').length){
				CURRENT_PAGE++;
			}
			else return;
		}
		else {
			CURRENT_PAGE = e.currentTarget.innerHTML;
		}
		if (searchURL)
			getPageOfResults(CURRENT_PAGE,searchURL);
	});

});


class Result {
	constructor(type, title, year, genre, plot, imdb, starring, img){
		this.type = type;
		this.title = title;
		this.year = year;
		this.genre = genre;
		this.plot = plot;
		this.starring = starring;
		this.imdb = "http://www.imdb.com/title/" + imdb;
		this.img = img;
	}

	get $element (){					
		var $resultElementToAdd = $('#result-template').clone();
		$resultElementToAdd.removeClass('template');
		$resultElementToAdd.find('.title').text(this.title);
		$resultElementToAdd.find('.title').attr('href',this.imdb);
		$resultElementToAdd.find('.year').text("(" + this.year + ")");
		$resultElementToAdd.find('.starring').text("Starring " + this.starring);
		$resultElementToAdd.find('.plot').text(this.plot);
		$resultElementToAdd.find('.genre').text(this.genre);
		console.log("thisimg" + this.img);
		if (this.img)
			$resultElementToAdd.find('img').attr('src',this.img);
			else
			$resultElementToAdd.find('img').attr('src',"");
		return $resultElementToAdd;
	}
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
		success: function(searchResults) {
			let totalSearchResults = searchResults.totalResults;
			if( searchResults.Response != "False"){
				var $resultsArea = $('#results-area');
				var $resultsToAppend = [];
				var pageArray = []; 

				for (var i = 0; i < searchResults.Search.length; i++){
					var oldTitle = encodeURIComponent((searchResults.Search[i].Title)).replace(/%20/g,"+");
					$.ajax("http://www.omdbapi.com/?t=" + oldTitle, {
						success: function(data) {
							var title = data.Title;
							var year = data.Year;
							var imdb = data.imdbID;
							var genre = data.Genre;
							var plot = data.Plot;
							var type = data.Type;
							var starring = data.Actors;
							var img = false;

							$.ajax("https://api.themoviedb.org/3/find/"+ imdb + "?external_source=imdb_id&api_key=d30a3154577a074b866f6a5123696362", {
								complete:function(res){
									if(res.responseJSON.movie_results.length){
										img = "https://image.tmdb.org/t/p/original/" + res.responseJSON.movie_results[0].poster_path;
									} else img = 0;
									var resultToAdd = new Result(type, title, year, genre, plot, imdb, starring, img);
									$resultsToAppend.push(resultToAdd.$element);
									pageArray.push(resultToAdd);
									if ($resultsToAppend.length >= searchResults.Search.length){
										PAGES_ARRAY = [];
										let totalNumPages = Math.ceil(totalSearchResults/10);
										if(totalNumPages > 1){
											$('nav').css('display','block');
											let $numberButtonsToAdd = [];
											for(var i = 1; i <= totalNumPages; i++){
												let $numberButton = $('li.template').clone().removeClass('template');
												$numberButton.find('a').text(i);
												$numberButtonsToAdd.push($numberButton);
											}
											$numberButtonsToAdd[CURRENT_PAGE - 1].addClass('active');
											$('ul>li>.number-button').parent().remove();
											$('.previous-button').parent().after($numberButtonsToAdd);
										}

										$resultsArea.empty();
										$resultsArea.append(...$resultsToAppend);
										console.log('asd');
										$('html,body').scrollTop(0);
										$('#search-button').text('Search!');
										if (!PAGES_ARRAY[pageToGet - 1])
											PAGES_ARRAY[pageToGet - 1] = pageArray;
									}
									else {
									}
								}
							});
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




