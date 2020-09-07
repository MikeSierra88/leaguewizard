'use strict';
/* global $ */

$(document).ready(function(){
    $("#matchModalMatchDate").attr('max', new Date().toISOString().substr(0,10));
    
    // Delete confirmation modal handler
    
    $('#deleteConfirmModal').on('show.bs.modal', function (event) {
       var button = $(event.relatedTarget);
       if (button.data('deletetype') == "team") {
           $('#modalTipusTxt').text('team');
           $('#modalItemKat').text('');
           $('#modalItemName').text('Player name: ' +  button.data('teamname'));
           var formActionTeam = "/leagues/" + button.data('league') + "/teams/"
                            + button.data('team');
           $("#modalDeleteConfirmForm").attr('action', formActionTeam);
       } else if (button.data('deletetype') == "match") {
           $('#modalTipusTxt').text('match');
           $('#modalItemName').text('' +  button.data('hometeamname') + ' ' +
                button.data('homescore') + ' - ' + button.data('awayscore') + ' ' +
                button.data('awayteamname') + ' on ' + button.data('matchdate'));
           var formActionMatch = "/leagues/" + button.data('league') + "/matches/"
                            + button.data('match');
           $("#modalDeleteConfirmForm").attr('action', formActionMatch);
       } else if (button.data('deletetype') == "league") {
           $('#modalTipusTxt').text('league');
           $('#modalItemName').text('League name: ' +  button.data('leaguename'));
           var formActionLeague = "/leagues/" + button.data('league');
           $("#modalDeleteConfirmForm").attr('action', formActionLeague);
       }
   });
   
   // AJAX Delete handling
   $("#modalDeleteConfirmForm").on('submit', function(event) {
      event.preventDefault();
      ajaxDelete($("#modalDeleteConfirmForm").attr('action'));
   });
   
   function ajaxDelete(action) {
       $.ajax({
          type: "DELETE",
          url: action,
          success: function() {
              window.location.reload();
          },
          error: function(result) {
                $('#deleteConfirmModal').modal('toggle');
                $("#danger-alert-text").text(result.responseJSON.message);
                $("#danger-alert").fadeTo(3000, 500).slideUp(500, function() {
                  $("#danger-alert").slideUp(500);
                });
                return result.responseJSON.success;
          }
       });
   }
   
   // League modal handler
   
   $('#leagueModal').on('show.bs.modal', function (event) {
       var button = $(event.relatedTarget);
       if (button.data('purpose') == "edit") {
           // set form purpose to edit
           $('#leagueModalForm').data('purpose', 'edit');
           $('#leagueModalLongTitle').text("Edit league name");
           $('input[id=leagueModalLeagueId]').val(button.data('league'));
           $('#leagueModalLeagueName').val(button.data('leaguename'));
           var formActionLeague = "/leagues/" + button.data('league');
           $("#leagueModalForm").attr('action', formActionLeague);
       } else if (button.data('purpose') == "new") {
           // set form purpose to edit
           $('#leagueModalForm').data('purpose', 'new');
           $('#leagueModalLongTitle').text("Add new league");
           $('input[id=leagueModalLeagueId]').val("");
           $('#leagueModalLeagueName').val("");
           formActionLeague = "/leagues";
           $("#leagueModalForm").attr('action', formActionLeague);
       }
   });
   
   // AJAX LEAGUE FORM HANDLING
    $('#leagueModalForm').on('submit', function(event) {
        event.preventDefault();
        var formData = {
            league:    $("input[id=leagueModalLeagueId]").val(),
            name:      $("#leagueModalLeagueName").val()
        };
        console.log("Sending AJAX request");
        ajaxLeague($("#leagueModalForm").attr('action'), $("#leagueModalForm").data('purpose'), formData);
    });
    
    function ajaxLeague(action, purpose, formData) {
        $.ajax({
           type: (purpose == 'edit') ? "PUT" : "POST",
           url: action,
           data: formData,
           dataType: "json",
           success: function() {
               window.location.reload();
           },
           error: function(result) {
               console.log(result)
                $('#matchModal').modal('toggle');
                $("#danger-alert-text").text(result.responseJSON.message);
                $("#danger-alert").fadeTo(3000, 500).slideUp(500, function() {
                  $("#danger-alert").slideUp(500);
                });
                return result.responseJSON.success;
           }
        });
    }
   
   // Team modal handler
   
   $('#teamModal').on('show.bs.modal', function (event) {
       var button = $(event.relatedTarget);
       if (button.data('purpose') == "edit") {
           // set form purpose to edit
           $('#teamModalForm').data('purpose', 'edit');
           $('#teamModalLongTitle').text("Edit team details");
           console.log(button.data('league'));
           $('input[id=teamModalLeagueId]').val(button.data('league'));
           $('#teamModalTeamName').val(button.data('teamname'));
           $('#teamModalTeamFIFA').val(button.data('fifaname'));
           var formActionTeam = "/leagues/" + button.data('league') + "/teams/"
                            + button.data('team');
           $("#teamModalForm").attr('action', formActionTeam);
       } else if (button.data('purpose') == "new") {
           // set form purpose to new
           $('#teamModalForm').data('purpose', 'new');
           $('#teamModalLongTitle').text("Add new team");
           $('input[id=teamModalLeagueId]').val(button.data('league'));
           $('#teamModalTeamName').val("");
           $('#teamModalTeamFIFA').val("");
           formActionTeam = "/leagues/" + button.data('league') + "/teams/";
           $("#teamModalForm").attr('action', formActionTeam);
       }
   });
   
   // AJAX TEAM FORM HANDLING
    $('#teamModalForm').on('submit', function(event) {
        event.preventDefault();
        var formData = {
            league:    $("input[id=teamModalLeagueId]").val(),
            name:      $('#teamModalTeamName').val(),
            footballTeam: $('#teamModalTeamFIFA').val()
        };
        console.log("Sending AJAX request");
        ajaxTeam($("#teamModalForm").attr('action'), formData);
    });
    
    function ajaxTeam(action, formData) {
        $.ajax({
           type: ($('#teamModalForm').data('purpose') == 'edit') ? "PUT" : "POST",
           url: action,
           data: formData,
           dataType: "json",
           success: function() {
               window.location.reload();
           },
           error: function(result) {
                $('#teamModal').modal('toggle');
                $("#danger-alert-text").text(result.responseJSON.message);
                $("#danger-alert").fadeTo(3000, 500).slideUp(500, function() {
                  $("#danger-alert").slideUp(500);
                });
                return result.responseJSON.success;
           }
        });
    }
   
   // Match modal handler
   
   $('#matchModal').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        if (button.data('purpose') == "edit") {
            // set form purpose to edit
            $('#modalMatchForm').data('purpose', 'edit');
            
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
            var formActionMatch = "/leagues/" + button.data('league') + "/matches";
            $("#modalMatchForm").attr('action', formActionMatch);
        } else if (button.data('purpose') == "new") {
            // set form purpose to new
            $('#modalMatchForm').data('purpose', 'new');
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
            formActionMatch = "/leagues/" + button.data('league') + "/matches";
            $("#modalMatchForm").attr('action', formActionMatch);
        } else if (button.data('purpose') == "newFromTable") {
            // set form purpose to new
            $('#modalMatchForm').data('purpose', 'new');
            $("#matchModalLongTitle").text("Add new match");
            // Get teams from data
            $("input[id=matchModalHomeTeam]").val(button.data('hometeam'));
            $("#matchModalHomeTeamName").val(button.data('hometeam'));
            $("#matchModalHomeTeamFIFA").val(button.data('hometeam'));
            $("input[id=matchModalAwayTeam]").val(button.data('awayteam'));
            $("#matchModalAwayTeamName").val(button.data('awayteam'));
            $("#matchModalAwayTeamFIFA").val(button.data('awayteam'));
            $("input[id=matchModalLeagueId]").val(button.data('league'));
            $("input[id=matchModalMatchId]").val('');
            $("#matchModalHomeScore").val('');
            $("#matchModalAwayScore").val('');
            $("#matchModalMatchDate").val(new Date().toISOString().substr(0,10));
            formActionMatch = "/leagues/" + button.data('league') + "/matches";
            $("#modalMatchForm").attr('action', formActionMatch);
        }
        
    });
    
    
    // AJAX MATCH FORM HANDLING
    $('#modalMatchForm').on('submit', function(event) {
        event.preventDefault();
        if ( !($('#modalMatchForm')[0].checkValidity()) ) {
            $('#matchModal').modal('toggle');
                $("#danger-alert-text").text("You entered invalid match data, please check and try again!");
                $("#danger-alert").fadeTo(3000, 500).slideUp(500, function() {
                  $("#danger-alert").slideUp(500);
                });
        } else {
            var formData = {
                matchId:   $("input[id=matchModalMatchId]").val(),
                league:    $("input[id=matchModalLeagueId]").val(),
                homeTeam:  $("input[id=matchModalHomeTeam]").val(),
                awayTeam:  $("input[id=matchModalAwayTeam]").val(),
                homeScore: $("#matchModalHomeScore").val(),
                awayScore: $("#matchModalAwayScore").val(),
                date:      $("#matchModalMatchDate").val()
            };
            ajaxMatch($("#modalMatchForm").attr('action'), formData);
        }
    });
    
    function ajaxMatch(action, formData) {
        $.ajax({
           type: ($('#modalMatchForm').data('purpose') == 'edit') ? "PUT" : "POST",
           url: action,
           data: formData,
           dataType: "json",
           success: function(result) {
               if (result.queued) {
                   $('#matchModal').modal('toggle');
                   $("#success-alert-text").text(result.message);
                   $("#success-alert").fadeTo(3000, 500).slideUp(500, function() {
                      $("#success-alert").slideUp(500);
                   });
               } else {
                   window.location.reload();
               }
           },
           error: function(result) {
                $('#matchModal').modal('toggle');
                $("#danger-alert-text").text(result.responseJSON.message);
                $("#danger-alert").fadeTo(3000, 500).slideUp(500, function() {
                  $("#danger-alert").slideUp(500);
                });
                return result.responseJSON.success;
           }
        });
    }
    
    // Match dialog team selection
    
    $("#matchModalHomeTeamName").change(function() {
        var id = $("#matchModalHomeTeamName").val();
        $("#matchModalHomeTeamFIFA").val(id);
        $("input[id=matchModalHomeTeam]").val(id);
        checkTeamValidity();
    });

    $("#matchModalHomeTeamFIFA").change(function() {
        var id = $("#matchModalHomeTeamFIFA").val();
        $("#matchModalHomeTeamName").val(id);
        $("input[id=matchModalHomeTeam]").val(id);
        checkTeamValidity();
    });

    $("#matchModalAwayTeamName").change(function() {
        var id = $("#matchModalAwayTeamName").val();
        $("#matchModalAwayTeamFIFA").val(id);
        $("input[id=matchModalAwayTeam]").val(id);
        checkTeamValidity();
    });

    $("#matchModalAwayTeamFIFA").change(function() {
        var id = $("#matchModalAwayTeamFIFA").val();
        $("#matchModalAwayTeamName").val(id);
        $("input[id=matchModalAwayTeam]").val(id);
        checkTeamValidity();
    });
    
    function checkTeamValidity() {
       if ( ($("input[id=matchModalHomeTeam]").val() == $("input[id=matchModalAwayTeam]").val())
            || !$("input[id=matchModalHomeTeam]").val() || !$("input[id=matchModalAwayTeam]").val() )  {
            $("#matchModalHomeTeamName").addClass('is-invalid');
            $("#matchModalHomeTeamName").removeClass('is-valid');
            $("#matchModalHomeTeamFIFA").addClass('is-invalid');
            $("#matchModalHomeTeamFIFA").removeClass('is-valid');
            $("#matchModalAwayTeamName").addClass('is-invalid');
            $("#matchModalAwayTeamName").removeClass('is-valid');
            $("#matchModalAwayTeamFIFA").addClass('is-invalid');
            $("#matchModalAwayTeamFIFA").removeClass('is-valid');
        } else {
            $("#matchModalHomeTeamName").addClass('is-valid');
            $("#matchModalHomeTeamName").removeClass('is-invalid');
            $("#matchModalHomeTeamFIFA").addClass('is-valid');
            $("#matchModalHomeTeamFIFA").removeClass('is-invalid');
            $("#matchModalAwayTeamName").addClass('is-valid');
            $("#matchModalAwayTeamName").removeClass('is-invalid');
            $("#matchModalAwayTeamFIFA").addClass('is-valid');
            $("#matchModalAwayTeamFIFA").removeClass('is-invalid');
        } 
    };
});