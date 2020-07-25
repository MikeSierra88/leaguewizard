/* global $ */
var match = JSON.parse($("#variableJSON").text());
$("#variableJSON").remove();

console.log("newmatch JS connected");
$(document).ready(function(){
    $("#date").val(new Date().toISOString().substr(0,10));
    $("#homeTeam").val(match.homeTeam);
    $("#homeTeamName").val(match.homeTeam);
    $("#homeTeamFIFA").val(match.homeTeam);
    $("#awayTeam").val(match.awayTeam);
    $("#awayTeamFIFA").val(match.awayTeam);
    $("#awayTeamName").val(match.awayTeam);
});

$("#homeTeamName").change(function(){
    var id = $("#homeTeamName").val();
    $("#homeTeamFIFA").val(id);
    $("#homeTeam").val(id);
});

$("#homeTeamFIFA").change(function(){
    var id = $("#homeTeamFIFA").val();
    $("#homeTeamName").val(id);
    $("#homeTeam").val(id);
});

$("#awayTeamName").change(function(){
    var id = $("#awayTeamName").val();
    $("#awayTeamFIFA").val(id);
    $("#awayTeam").val(id);
});

$("#awayTeamFIFA").change(function(){
    var id = $("#awayTeamFIFA").val();
    $("#awayTeamName").val(id);
    $("#awayTeam").val(id);
});
