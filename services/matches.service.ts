import { Team } from '../models/TeamModel';

export interface MatchWithTeamData {
  id?: string;
  league: string;
  homeTeamId: string;
  homeTeam: Team;
  homeScore: number;
  awayTeamId: string;
  awayTeam: Team;
  awayScore: number;
  createdDate?: Date;
  confirmed?: boolean;
}
