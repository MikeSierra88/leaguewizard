console.log("LeagueAdmin connected");

$(document).ready(function(){
    
    $('#addAdminInput').keyup((event) => {
        console.log("HIT");
    });
    
    
    $('.approveMatchBtn').each(function() {
        $(this).on('click', function() {
           ajaxApproveMatch($(this).data('match-id'), $(this).data('league-id'));
        });
    });
    
    $('.rejectMatchBtn').each(function() {
        $(this).on('click', function() {
           ajaxRejectMatch($(this).data('match-id'), $(this).data('league-id'));
        });
    });
    
    
    
    // AJAX POST request to approve a match from queue
    function ajaxApproveMatch(matchId, leagueId) {
        $.ajax({
            type: "POST",
            url: "/league-admin/" + leagueId + "/approve-match/" + matchId,
            success: function(result) {
                if (result.success) {
                    var selector = "#queueRow-" + matchId;
                    $(selector).remove();
                    $("#success-alert-text").text(result.message);
                    $("#success-alert").fadeTo(2000, 500).slideUp(500, function() {
                      $("#success-alert").slideUp(500);
                    });
                    return result.success;
                } else {
                    $(selector).remove();
                    $("#danger-alert-text").text(result.message);
                    $("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
                      $("#danger-alert").slideUp(500);
                    });
                    return result.success;
                }
            },
            error: function (err) {
                $("#danger-alert-text").text(err);
                $("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
                  $("#danger-alert").slideUp(500);
                });
                return false;
            }
        });
    }
    
    // AJAX POST request to approve a match from queue
    function ajaxRejectMatch(matchId, leagueId) {
        $.ajax({
            type: "POST",
            url: "/league-admin/" + leagueId + "/reject-match/" + matchId,
            success: function(result) {
                if (result.success) {
                    var selector = "#queueRow-" + matchId;
                    $(selector).remove();
                    $("#success-alert-text").text(result.message);
                    $("#success-alert").fadeTo(2000, 500).slideUp(500, function() {
                      $("#success-alert").slideUp(500);
                    });
                    return result.success;
                } else {
                    $(selector).remove();
                    $("#danger-alert-text").text(result.message);
                    $("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
                      $("#danger-alert").slideUp(500);
                    });
                    return result.success;
                }
                
            },
            error: function (err) {
                $("#danger-alert-text").text(err);
                $("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
                  $("#danger-alert").slideUp(500);
                });
                return false;
            }
        });
    }
})