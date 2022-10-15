import { Team } from '../models/TeamModel';

export interface MatchWithTeamData {
  _id?: string;
  league: string;
  homeTeam: Team;
  homeScore: number;
  awayTeam: Team;
  awayScore: number;
  createdDate?: Date;
  confirmed?: boolean;
}
