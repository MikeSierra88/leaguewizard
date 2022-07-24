import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import dbConnect from '../../../../lib/dbConnect';
import LeagueModel, { League } from '../../../../models/LeagueModel';
import MatchModel, { Match } from '../../../../models/MatchModel';
import mongoose from 'mongoose';
import Errors from '../../../../models/Errors';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { leagueId, team } = req.query;
  const { user } = getSession(req, res);

  const connection: mongoose.Connection = await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const league = await LeagueModel.findById(leagueId);
        if (league.owner === user.sub || league.participants.includes(user.sub)) {
          let matches: Match[];
          if (team) {
            matches = await MatchModel.find<Match>({
              league: leagueId,
              $or: [{ homeTeam: team }, { awayTeam: team }],
            })
              .populate('homeTeam')
              .populate('awayTeam');
          } else {
            matches = await MatchModel.find<Match>({ league: leagueId }).populate('homeTeam').populate('awayTeam');
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
      const postSession = await connection.startSession();
      try {
        await postSession.startTransaction();
        const league = await LeagueModel.findById<League>(leagueId);
        if (!league.participants.includes(user.sub) && league.owner !== user.sub) {
          await postSession.abortTransaction();
          await postSession.endSession();
          return res.status(401).json({ success: false });
        }
        const newMatch: Match = {
          league: league._id,
          // all matches are confirmed in first version
          confirmed: true,
          homeTeam: req.body.homeTeam,
          homeScore: req.body.homeScore,
          awayTeam: req.body.awayTeam,
          awayScore: req.body.awayScore,
        };
        // TODO: implement match confirmation
        // disabling match confirmation for MVP
        // if (league.owner === user.sub) {
        //   newMatch.confirmed = true;
        // }
        const newMatchInDB = await MatchModel.create<Match>(newMatch);
        await postSession.commitTransaction();
        await postSession.endSession();
        return res.status(201).json({ success: true, data: newMatchInDB });
      } catch (error) {
        console.error('Error while processing POST', error);
        await postSession.abortTransaction();
        await postSession.endSession();
        return res.status(400).json({ success: false, error });
      }
    case 'DELETE':
      if (!leagueId) {
        return res.status(400).json({ success: false, error: Errors.NO_LEAGUE_ID_PROVIDED });
      }
      const deleteSession = await connection.startSession();
      try {
        await deleteSession.startTransaction();
        const league = await LeagueModel.findById<League>(leagueId);
        if (!league || league.owner !== user.sub) {
          await deleteSession.abortTransaction();
          await deleteSession.endSession();
          return res.status(401).json({ success: false });
        }
        await MatchModel.deleteMany({ league: leagueId });
        await deleteSession.commitTransaction();
        await deleteSession.endSession();
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error while processing DELETE', error);
        await deleteSession.abortTransaction();
        await deleteSession.endSession();
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
