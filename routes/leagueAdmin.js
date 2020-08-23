var express    = require('express'),
    router     = express.Router(),
    middleware = require('../middleware'),
    User       = require('../models/user'),
    League     = require('../models/league');
    

// router.get("/:leagueid", 
//     middleware.isLoggedIn,
//     function(req, res) {
//         League.findById(req.params.leagueid, async function(err, foundLeague) {
//             if (err) {
//                 res.status(500).render("error", {error: err});
//             } else {
//                 var userList = await User.find( { isVerified: true }, {playerName: 1} );
//                 if (req.user._id.equals(foundLeague.creator)) {
//                     res.render("league-admin/index", {
//                         title: "League Management - League Wizard",
//                         pageType: "leagueAdmin",
//                         isOwner: true,
//                         league: foundLeague,
//                         userList: userList
//                     });
//                 } else if (foundLeague.admins.contains(req.user._id)) {
//                     res.send("ONLY ADMIN")
//                 } else {
//                     res.redirect("/");
//                 }
//             } 
//         })
        
    
// });

router.get("/", function(req, res) {
    res.redirect("/")
});


module.exports = router;