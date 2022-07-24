import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import TeamModel, { Team } from '../../../models/TeamModel';
import LeagueModel, { League } from '../../../models/LeagueModel';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/dbConnect';
import MatchModel from '../../../models/MatchModel';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { teamId } = req.query;
  const { user } = getSession(req, res);

  const connection: mongoose.Connection = await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const team = await TeamModel.findById<Team>(teamId);
        const league = await LeagueModel.findById(team.league);
        if (league.owner === user.sub || league.participants.includes(user.sub)) {
          return res.status(200).json({ success: true, data: team });
        }
        return res.status(401).json({ success: false });
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    case 'DELETE':
      const deleteSession = await connection.startSession();
      try {
        await deleteSession.startTransaction();
        const team = await TeamModel.findById<Team>(teamId);
        const league = await LeagueModel.findById<League>(team.league);
        if (user.sub !== league.owner && user.sub !== team.owner) {
          await deleteSession.abortTransaction();
          await deleteSession.endSession();
          return res.status(401).json({ success: false });
        }
        await MatchModel.deleteMany({ $or: [{ homeTeam: teamId }, { awayTeam: teamId }] });
        await TeamModel.findByIdAndDelete(teamId);
        await LeagueModel.findByIdAndUpdate(league._id, { $pull: { participants: team.owner } });
        await deleteSession.commitTransaction();
        await deleteSession.endSession();
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error('Error while processing DELETE', err);
        await deleteSession.abortTransaction();
        await deleteSession.endSession();
        return res.status(400).json({ success: false, err });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
