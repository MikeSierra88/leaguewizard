export interface Match {
  id?: string;
  league: string;
  homeTeam: string;
  homeScore: number;
  awayTeam: string;
  awayScore: number;
  createdDate?: Date;
  confirmed?: boolean;
}
