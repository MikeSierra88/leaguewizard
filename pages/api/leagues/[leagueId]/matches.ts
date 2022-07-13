import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import dbConnect from '../../../../lib/dbConnect';
import LeagueModel, { League } from '../../../../models/LeagueModel';
import MatchModel, { Match } from '../../../../models/MatchModel';
import mongoose from 'mongoose';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { leagueId, team } = req.query;
  const { user } = getSession(req, res);

  const connection: mongoose.Connection = await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const league = await LeagueModel.findById(leagueId);
        if (
          league.owner === user.sub ||
          league.participants.includes(user.sub)
        ) {
          let matches: Match[];
          if (team) {
            matches = await MatchModel.find<Match>({
              league: leagueId,
              $or: [{ homeTeam: team }, { awayTeam: team }],
            })
              .populate('homeTeam')
              .populate('awayTeam');
          } else {
            matches = await MatchModel.find<Match>({ league: leagueId })
              .populate('homeTeam')
              .populate('awayTeam');
          }
          return res.status(200).json({ success: true, data: matches });
        } else {
          return res.status(401).json({ success: false });
        }
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    case 'POST':
      const session = await connection.startSession();
      try {
        await session.startTransaction();
        const league = await LeagueModel.findById<League>(leagueId);
        if (
          !league.participants.includes(user.sub) &&
          league.owner !== user.sub
        ) {
          await session.abortTransaction();
          await session.endSession();
          return res.status(401).json({ success: false });
        }
        const newMatch: Match = {
          league: league._id,
          homeTeam: req.body.homeTeam,
          homeScore: req.body.homeScore,
          awayTeam: req.body.awayTeam,
          awayScore: req.body.awayScore,
        };
        if (league.owner === user.sub) {
          newMatch.confirmed = true;
        }
        const newMatchInDB = await MatchModel.create<Match>(newMatch);
        await session.commitTransaction();
        await session.endSession();
        return res.status(201).json({ success: true, data: newMatchInDB });
      } catch (error) {
        console.error('Error while processing POST', error);
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
