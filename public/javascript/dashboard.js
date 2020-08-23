'use strict';
$(document).ready(function(){
    $('.fav-star').tooltip();
    resetListeners();
    
    function resetListeners() {
    
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
    
    
    function ajaxAddFav(userId, leagueId, span) {
        $.ajax({
                type: "POST",
                url: "/users/"+ userId + "/add-favorite/" + leagueId,
                success: function(result) {
                    span.html('Added to favorites <i class="fas fa-star"></i>');
                    span.addClass('is-favorite');
                    span.removeClass('not-favorite');
                    span.attr('data-original-title', 'Remove from favorites');
                    resetListeners();
                    return result.success;
                },
                error: function(err) {
                    console.log(err);
                    return false;
                }
            });
    }
    
    function ajaxRemoveFav(userId, leagueId, span) {
        $.ajax({
            type: "POST",
            url: "/users/"+ userId + "/remove-favorite/" + leagueId,
            success: function(result) {
                    span.html('Removed from favorites <i class="far fa-star"></i>');
                    span.addClass('not-favorite');
                    span.removeClass('is-favorite');
                    span.attr('data-original-title', 'Add to favorites');
                    resetListeners();
                    return result.success;
                },
            error: function(err) {
                console.log(err);
                return false;
            }
        });
    }
});