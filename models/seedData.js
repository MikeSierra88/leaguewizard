const   mongoose = require('mongoose'),
        League   = require('./league'),
        Team     = require('./team'),
        Match    = require('./match');
      
// Seed database

async function seed() {
    var testTeam1 = new Team({
        name: "PC",
        footballTeam: "Manchester United",
        position: 1,
        played: 1,
        won: 1,
        draw: 0,
        lost: 0,
        goalsfor: 2,
        goalsagainst: 1
    });
    var testTeam2 = new Team({
        name: "HX",
        footballTeam: "Borussia Dortmund",
        position: 2,
        played: 1,
        won: 0,
        draw: 0,
        lost: 1,
        goalsfor: 1,
        goalsagainst: 2
    });
    var testLeague = new League({
        name: "my league"
    });
    
    try {
        await testLeague.save(async function(err, league) {
            var matchLeague = league._id,
                matchTeam1, matchTeam2;
            if(err) {
                console.log(err);
            } else {
                console.log("league saved, id: " + league._id);
                testTeam1.league = league._id;
                testTeam2.league = league._id;
                await testTeam1.save(async function(err, savedTeam){
                    if(err) {
                        console.log(err);
                    } else {
                        league.teams.push(savedTeam._id);
                        matchTeam1 = savedTeam._id;
                        console.log("Team saved, id: " + savedTeam._id);
                        await testTeam2.save(async function(err, savedTeam){
                            if(err) {
                                console.log(err);
                            } else {
                                league.teams.push(savedTeam._id);
                                matchTeam2 = savedTeam._id;
                                console.log("Team saved, id: " + savedTeam._id);
                                
                                var testMatch = new Match({
                                    league: matchLeague,
                                    homeTeam: matchTeam1,
                                    awayTeam: matchTeam2,
                                    homeScore: 2,
                                    awayScore: 1
                                });
                                
                                await testMatch.save(function(err, match){
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        console.log("match saved with id " + match._id);
                                        league.matches.push(match._id);
                                        league.save();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    catch (err) {
        console.log(err);
    }
}

seed();