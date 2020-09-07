$(document).ready(() => {
    $('.league-card').each((i, card) => {
       $(card).on('click', (e) => {
           window.location = "/leagues/" + $(card).data("leagueid");
       })
       
    });
});