var league = JSON.parse($("#variableJSON1").text());
$("#variableJSON1").remove();
var team = JSON.parse($("#variableJSON2").text());
$("#variableJSON2").remove();
$(document).ready(function(){
    league.matches.forEach((match) => {
        if (match.homeTeam == team._id) {
            var counterId = "#home" + match.awayTeam
            $(counterId).html((parseInt($(counterId).html(), 10)-1))
        }
        if (match.awayTeam == team._id) {
            var counterId = "#away" + match.homeTeam
            $(counterId).html((parseInt($(counterId).html(), 10)-1))
        }
    });
});