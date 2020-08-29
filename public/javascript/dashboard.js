'use strict';
/* global $ */
$(document).ready(function(){
    // activate tooltips
    $('.fav-star').tooltip();
    
    // set "favorites" listeners on page load
    resetFavListeners();
    
    // count outstanding queue items and display in menu
    var queueCounter = 0;
    $('.leagueQueueCount').each(function() {
        if ($(this).text().length > 0) {
            queueCounter += parseInt($(this).text());
        }
    });
    if(queueCounter > 0) {
        $('#queueCounter').text(queueCounter);
        $('#queueCounter').show();
    } else {
        $('#queueCounter').hide();
    }
    
    // HELPER FUNCTIONS
    
    // reset the listeners on the page
    // called on page load, then after adding or removing a favorite
    function resetFavListeners() {
    
        $('.fav-star.is-favorite').off('click').on('click', function() {
            var leagueId = $(this).data('leagueid');
            var userId = $(this).data('userid');
            ajaxRemoveFav(userId, leagueId, $(this));
        });
    
        $('.fav-star.not-favorite').off('click').on('click', function() {
            var leagueId = $(this).data('leagueid');
            var userId = $(this).data('userid');
            ajaxAddFav(userId, leagueId, $(this));
        });
    }
    
    // AJAX POST request to add a favorite
    function ajaxAddFav(userId, leagueId, span) {
        $.ajax({
                type: "POST",
                url: "/users/"+ userId + "/add-favorite/" + leagueId,
                success: function(result) {
                    if (result.success) {
                        $("#info-alert-text").text(result.message);
                        $("#info-alert").fadeTo(2000, 500).slideUp(500, function() {
                          $("#info-alert").slideUp(500);
                        });
                        span.html('<i class="fas fa-star"></i>');
                        span.addClass('is-favorite');
                        span.removeClass('not-favorite');
                        span.attr('data-original-title', 'Remove from favorites');
                        resetFavListeners();
                        return result.success;
                    } else {
                        $("#danger-alert-text").text(result.message);
                        ("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
                          $("#danger-alert").slideUp(500);
                        });
                        return result.success;
                    }
                    
                },
                error: function(err) {
                    $("#danger-alert-text").text(err);
                    ("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
                      $("#danger-alert").slideUp(500);
                    });
                    return false;
                }
            });
    }
    
    // AJAX POST request to remove a favorite
    function ajaxRemoveFav(userId, leagueId, span) {
        $.ajax({
            type: "POST",
            url: "/users/"+ userId + "/remove-favorite/" + leagueId,
            success: function(result) {
                    if (result.success) {
                        $("#info-alert-text").text(result.message);
                        $("#info-alert").fadeTo(2000, 500).slideUp(500, function() {
                          $("#info-alert").slideUp(500);
                        });
                        span.html('<i class="far fa-star"></i>');
                        span.addClass('not-favorite');
                        span.removeClass('is-favorite');
                        span.attr('data-original-title', 'Add to favorites');
                        resetFavListeners();
                        return result.success;
                    } else {
                        $("#danger-alert-text").text(result.message);
                        ("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
                          $("#danger-alert").slideUp(500);
                        });
                        return result.success;
                    }
                },
            error: function(err) {
                $("#danger-alert-text").text(err);
                    ("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
                      $("#danger-alert").slideUp(500);
                    });
                return false;
            }
        });
    }
    

});