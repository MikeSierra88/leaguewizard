import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import dbConnect from '../../../lib/dbConnect';
import LeagueModel from '../../../models/LeagueModel';
import InviteCode from '../../../models/InviteCodeModel';
import mongoose from 'mongoose';
import Errors from '../../../models/Errors';
import MatchModel from '../../../models/MatchModel';
import TeamModel from '../../../models/TeamModel';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { leagueId } = req.query;
  const { user } = getSession(req, res);

  const connection: mongoose.Connection = await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const league = await LeagueModel.findById(leagueId);
        if (league.owner === user.sub) {
          const extendedLeague = await league.populate({
            path: 'inviteCode',
            model: InviteCode,
          });
          return res.status(200).json({ success: true, data: extendedLeague });
        }
        if (league.participants.includes(user.sub)) {
          const limitedLeague = await LeagueModel.findById(leagueId, '-inviteCode -owner -participants');
          return res.status(200).json({ success: true, data: limitedLeague });
        } else {
          return res.status(401).json({ success: false });
        }
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    case 'PATCH':
      try {
        const updatedLeague = await LeagueModel.findByIdAndUpdate(leagueId, req.body, { returnDocument: 'after' });
        return res.status(200).json({ success: true, data: updatedLeague });
      } catch (error) {
        console.error('Error while processing PATCH', error);
        return res.status(400).json({ success: false, error });
      }
    case 'DELETE':
      if (!leagueId) {
        return res.status(400).json({ success: false, error: Errors.NO_LEAGUE_ID_PROVIDED });
      }
      const deleteSession = await connection.startSession();
      try {
        await deleteSession.startTransaction();
        const league = await LeagueModel.findById(leagueId);
        if (league.owner !== user.sub) {
          return res.status(401).json({ success: false });
        }
        await MatchModel.deleteMany({ league: leagueId });
        await TeamModel.deleteMany({ league: leagueId });
        await InviteCode.deleteMany({ league: leagueId });
        await LeagueModel.findByIdAndDelete(leagueId);
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
