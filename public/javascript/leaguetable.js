/* global $ */
var league = JSON.parse($("#variableJSON").text());
$("#variableJSON").remove();

$(document).ready(function(){
    $('#leagueTable').DataTable({
        "orderFixed": [[10, 'desc'], [9, 'desc'], [7, 'desc'], [8, 'asc']],
        "paging": false,
        "searching": false,
        "info": false,
        "responsive": true,
        "drawCallback": function(settings) {
            $(".leaguePos").each(function(i){
                $(this).html(i+1);
            })
        }
    });
    
});