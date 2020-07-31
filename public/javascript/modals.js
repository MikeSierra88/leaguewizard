$(document).ready(function(){
    
    // Delete confirmation modal handler
    
    $('#deleteConfirmModal').on('show.bs.modal', function (event) {
       var button = $(event.relatedTarget);
       if (button.data('deletetype') == "team") {
           $('#modalTipusTxt').text('team');
           $('#modalItemKat').text('');
           $('#modalItemName').text('Player name: ' +  button.data('teamname'));
           var formActionTeam = "/leagues/" + button.data('league') + "/teams/"
                            + button.data('team') + "?_method=DELETE";
           $("#modalDeleteConfirmForm").attr('action', formActionTeam);
       } else if (button.data('deletetype') == "match") {
           $('#modalTipusTxt').text('match');
           $('#modalItemName').text('' +  button.data('hometeamname') + ' ' +
                button.data('homescore') + ' - ' + button.data('awayscore') + ' ' +
                button.data('awayteamname') + ' on ' + button.data('matchdate'));
           var formActionMatch = "/leagues/" + button.data('league') + "/matches/"
                            + button.data('match') + "?_method=DELETE";
           $("#modalDeleteConfirmForm").attr('action', formActionMatch);
       } else if (button.data('deletetype') == "league") {
           $('#modalTipusTxt').text('league');
           $('#modalItemName').text('League name: ' +  button.data('leaguename'));
           var formActionLeague = "/leagues/" + button.data('league') + "?_method=DELETE";
           $("#modalDeleteConfirmForm").attr('action', formActionLeague);
       }
   });
   
   // League modal handler
   
   $('#leagueModal').on('show.bs.modal', function (event) {
       var button = $(event.relatedTarget);
       if (button.data('purpose') == "edit") {
           $('#leagueModalLongTitle').text("Edit league name");
           $('input[id=leagueModalLeagueId]').val(button.data('league'));
           $('#leagueModalLeagueName').val(button.data('leaguename'));
           var formActionLeague = "/leagues/" + button.data('league') + "?_method=PUT";
           $("#leagueModalForm").attr('action', formActionLeague);
       } else if (button.data('purpose') == "new") {
           $('#leagueModalLongTitle').text("Add new league");
           $('input[id=leagueModalLeagueId]').val("");
           $('#leagueModalLeagueName').val("");
           var formActionLeague = "/leagues";
           $("#leagueModalForm").attr('action', formActionLeague);
       }
   });
   
   // Team modal handler
   
   $('#teamModal').on('show.bs.modal', function (event) {
       var button = $(event.relatedTarget);
       if (button.data('purpose') == "edit") {
           $('#teamModalLongTitle').text("Edit team details");
           $('input[id=teamModalLeagueId]').val(button.data('league'));
           $('#teamModalTeamName').val(button.data('teamname'));
           $('#teamModalTeamFIFA').val(button.data('fifaname'));
           var formActionTeam = "/leagues/" + button.data('league') + "/teams/"
                            + button.data('team') + "?_method=PUT";
           console.log(formActionTeam);
           $("#teamModalForm").attr('action', formActionTeam);
       } else if (button.data('purpose') == "new") {
           $('#teamModalLongTitle').text("Add new team");
           $('input[id=teamModalLeagueId]').val(button.data('league'));
           $('#teamModalTeamName').val("");
           $('#teamModalTeamFIFA').val("");
           var formActionTeam = "/leagues/" + button.data('league') + "/teams/";
           $("#teamModalForm").attr('action', formActionTeam);
       }
   });
   
   // Match modal handler
   
   $('#matchModal').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        if (button.data('purpose') == "edit") {
            $("#matchModalLongTitle").text("Edit match details");
            // Populate modal form with data to edit
            $("input[id=matchModalHomeTeam]").val(button.data('hometeam'));
            $("#matchModalHomeTeamName").val(button.data('hometeam'));
            $("#matchModalHomeTeamFIFA").val(button.data('hometeam'));
            $("input[id=matchModalAwayTeam]").val(button.data('awayteam'));
            $("#matchModalAwayTeamName").val(button.data('awayteam'));
            $("#matchModalAwayTeamFIFA").val(button.data('awayteam'));
            $("input[id=matchModalLeagueId]").val(button.data('league'));
            $("input[id=matchModalMatchId]").val(button.data('match'));
            $("#matchModalHomeScore").val(button.data('homescore'));
            $("#matchModalAwayScore").val(button.data('awayscore'));
            // Parse date from string and insert to picker
            var matchDate = new Date(button.data('date'));
            $("#matchModalMatchDate").val(matchDate.toISOString().substr(0,10));
            // formulate action and insert into form
            var formActionMatch = "/leagues/" + button.data('league') + "/matches" +
                "?_method=PUT";
            $("#modalMatchForm").attr('action', formActionMatch);
        } else if (button.data('purpose') == "new") {
            $("#matchModalLongTitle").text("Add new match");
            // Clear modal form, only populate date and league id
            $("input[id=matchModalHomeTeam]").val('');
            $("#matchModalHomeTeamName").val('');
            $("#matchModalHomeTeamFIFA").val('');
            $("input[id=matchModalAwayTeam]").val('');
            $("#matchModalAwayTeamName").val('');
            $("#matchModalAwayTeamFIFA").val('');
            $("input[id=matchModalLeagueId]").val(button.data('league'));
            $("input[id=matchModalMatchId]").val('');
            $("#matchModalHomeScore").val('');
            $("#matchModalAwayScore").val('');
            $("#matchModalMatchDate").val(new Date().toISOString().substr(0,10));
            var formActionMatch = "/leagues/" + button.data('league') + "/matches";
            $("#modalMatchForm").attr('action', formActionMatch);
        }
        
    });
    
    // Match dialog team selection
    
    $("#matchModalHomeTeamName").change(function() {
        var id = $("#matchModalHomeTeamName").val();
        $("#matchModalHomeTeamFIFA").val(id);
        $("input[id=matchModalHomeTeam]").val(id);
    });

    $("#matchModalHomeTeamFIFA").change(function() {
        var id = $("#matchModalHomeTeamFIFA").val();
        $("#matchModalHomeTeamName").val(id);
        $("input[id=matchModalHomeTeam]").val(id);
    });

    $("#matchModalAwayTeamName").change(function() {
        var id = $("#matchModalAwayTeamName").val();
        $("#matchModalAwayTeamFIFA").val(id);
        $("input[id=matchModalAwayTeam]").val(id);
    });

    $("#matchModalAwayTeamFIFA").change(function() {
        var id = $("#matchModalAwayTeamFIFA").val();
        $("#matchModalAwayTeamName").val(id);
        $("input[id=matchModalAwayTeam]").val(id);
    });
    
});