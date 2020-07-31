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
    
    $('#teamMatches').DataTable({
        "order": [[6, 'desc'], [1, 'asc']],
        "paging": false,
        "searching": true,
        "info": false,
        "responsive": true,
        "ordering": true
    });
    
    $('#matchesRemaining').DataTable({
        "order": [[0, 'asc']],
        "paging": false,
        "searching": false,
        "info": false,
        "responsive": false,
        "ordering": true
    });
});