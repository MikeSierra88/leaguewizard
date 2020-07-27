var team = JSON.parse($("#variableJSON2").text());
$("#variableJSON2").remove();

$(document).ready(function(){
    team.matches.forEach((match) => {
        if (match.homeTeam._id == team._id) {
            var counterId = "#home" + match.awayTeam._id
            $(counterId).html((parseInt($(counterId).html(), 10)-1))
        }
        if (match.awayTeam._id == team._id) {
            var counterId = "#away" + match.homeTeam._id
            $(counterId).html((parseInt($(counterId).html(), 10)-1))
        }
    });
});