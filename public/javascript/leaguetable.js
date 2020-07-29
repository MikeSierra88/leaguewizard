/* global $ */
var league = JSON.parse($("#variableJSON").text());
$("#variableJSON").remove();

league.teams.forEach((team) => {
   team.played = 0;
   team.won = 0;
   team.draw = 0;
   team.lost = 0;
   team.goalsFor = 0;
   team.goalsAgainst = 0;
});

league.matches.forEach((match) => {
    var homeTeam = league.teams.filter((team => match.homeTeam == team._id))[0];
    var awayTeam = league.teams.filter((team => match.awayTeam == team._id))[0];
    homeTeam.played++; 
    awayTeam.played++;
    homeTeam.goalsFor += match.homeScore;
    awayTeam.goalsFor += match.awayScore;
    homeTeam.goalsAgainst += match.awayScore;
    awayTeam.goalsAgainst += match.homeScore;
    if (match.homeScore > match.awayScore) {
        homeTeam.won++;
        awayTeam.lost++;
    } else if (match.homeScore < match.awayScore) {
        awayTeam.won++;
        homeTeam.lost++;
    } else { 
        homeTeam.draw++; awayTeam.draw++; 
    }
});

$(document).ready(function(){
    league.teams.forEach((team) => {
        var selector = "#teamPlayed_" + team._id;
        $(selector).html(team.played);
        selector = "#teamWon_" + team._id;
        $(selector).html(team.won);
        selector = "#teamDraw_" + team._id;
        $(selector).html(team.draw);
        selector = "#teamLost_" + team._id;
        $(selector).html(team.lost);
        selector = "#teamGF_" + team._id;
        $(selector).html(team.goalsFor);
        selector = "#teamGA_" + team._id;
        $(selector).html(team.goalsAgainst);
        selector = "#teamGD_" + team._id;
        $(selector).html(team.goalsFor - team.goalsAgainst);
        selector = "#teamPoints_" + team._id;
        $(selector).html((Number(team.won) * 3) + (team.draw));
        
    });
    
    $('#leagueTable').DataTable({
        "orderFixed": [[10, 'desc'], [9, 'desc'], [7, 'desc'], [8, 'asc']],
        "paging": false,
        "searching": false,
        "info": false,
        "responsive": true,
        "drawCallback": function(settings) {
            $(".leaguePos").each(function(i){
                var pos = "" + (i+1)
                var _href = $(this).siblings().find(".team-details").attr("href");
                $(this).html(pos);
                $(this).siblings().find(".team-details").attr("href", _href + pos);
            })
        }
    });
    
    $('#allMatchesTable').DataTable({
        "order": [[0, 'desc'], [1, 'asc']],
        "paging": false,
        "searching": true,
        "info": false,
        "responsive": true,
        "ordering": true
    });
});