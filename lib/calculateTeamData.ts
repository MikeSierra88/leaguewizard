import { Team } from '../models/TeamModel';
import { MatchWithTeamData } from '../services/matches.service';

export type LeagueTableTeamData = {
  matchesPlayed: number,
  points: number,
  goalsFor: number,
  goalsAgainst: number,
  goalDiff: number,
};

export const calculateTeamData = (team: Team, matches: MatchWithTeamData[]): LeagueTableTeamData => {
  if (!team || !matches) return null;

  const sumOfArray = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const teamMatches = matches.filter((match) => team.id === match.homeTeamId || team.id === match.awayTeamId);
  const matchesPlayed = teamMatches.length;
  const points = sumOfArray(
    teamMatches.map((match) => {
      if (match.homeScore === match.awayScore) {
        return 1;
      }
      const ownScore = team.id === match.homeTeamId ? match.homeScore : match.awayScore;
      const oppScore = team.id === match.homeTeamId ? match.awayScore : match.homeScore;
      return ownScore > oppScore ? 3 : 0;
    })
  );
  const goalsFor = sumOfArray(teamMatches.map((match) => (team.id === match.homeTeamId ? match.homeScore : match.awayScore)));
  const goalsAgainst = sumOfArray(teamMatches.map((match) => (team.id === match.homeTeamId ? match.awayScore : match.homeScore)));
  const goalDiff = goalsFor - goalsAgainst;

  return {
    matchesPlayed,
    points,
    goalsFor,
    goalsAgainst,
    goalDiff,
  };
};

export const teamDataComparator = (v1, v2) => {
  if (v1.points !== v2.points) return v2.points - v1.points;
  if (v1.goalDiff !== v2.goalDiff) return v2.goalDiff - v1.goalDiff;
  if (v1.goalsFor !== v2.goalsFor) return v2.goalsFor - v1.goalsFor;
  return 0;
};

export const removeUserFromParticipants = (participantString: string, currentUser: string): string => {
  return participantString
    .split(' ')
    .filter((participant) => participant !== currentUser)
    .join(' ');
};
