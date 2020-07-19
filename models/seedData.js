const   mongoose = require('mongoose'),
        League   = require('./league'),
        Team     = require('./team'),
        Match    = require('./match');
      
// Seed database

async function seed() {
    var testTeam1 = new Team({
        name: "PC",
        footballTeam: "Manchester United",
        position: 2,
        played: 3,
        won: 1,
        draw: 1,
        lost: 1,
        goalsfor: 5,
        goalsagainst: 6
    });
    var testTeam2 = new Team({
        name: "HX",
        footballTeam: "Borussia Dortmund",
        position: 1,
        played: 3,
        won: 1,
        draw: 1,
        lost: 1,
        goalsfor: 6,
        goalsagainst: 5
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
                                
                                var testMatch1 = new Match({
                                        league: matchLeague,
                                        homeTeam: matchTeam1,
                                        awayTeam: matchTeam2,
                                        homeScore: 2,
                                        awayScore: 1
                                });
                                var testMatch2 = new Match({
                                        league: matchLeague,
                                        homeTeam: matchTeam2,
                                        awayTeam: matchTeam1,
                                        homeScore: 4,
                                        awayScore: 2
                                });
                                var testMatch3 = new Match({
                                        league: matchLeague,
                                        homeTeam: matchTeam2,
                                        awayTeam: matchTeam1,
                                        homeScore: 1,
                                        awayScore: 1
                                });
                                
                                await testMatch1.save(async function(err, match){
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        console.log("match saved with id " + match._id);
                                        league.matches.push(match._id);
                                        league.save();
                                        await testMatch2.save(async function(err, match2){
                                            if(err) {
                                            console.log(err);
                                            } else {
                                                console.log("match saved with id " + match2._id);
                                                league.matches.push(match2._id);
                                                league.save();
                                                await testMatch3.save(async function(err, match3){
                                                    if(err) {
                                                    console.log(err);
                                                    } else {
                                                        console.log("match saved with id " + match3._id);
                                                        league.matches.push(match3._id);
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
                });
            }
        });
    }
    catch (err) {
        console.log(err);
    }
}

seed();