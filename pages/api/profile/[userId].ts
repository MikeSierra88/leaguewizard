import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getManagementClient } from '../../../lib/auth0management';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/dbConnect';
import TeamModel, { Team } from '../../../models/TeamModel';
import MatchModel from '../../../models/MatchModel';
import LeagueModel, { League } from '../../../models/LeagueModel';
import InviteCodeModel from '../../../models/InviteCodeModel';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { userId } = req.query;
  const { user } = getSession(req, res);

  if (user?.sub !== userId) {
    return res.status(403).json({ success: false });
  }

  const managementClient = await getManagementClient();
  const connection: mongoose.Connection = await dbConnect();

  switch (method) {
    case 'DELETE':
      const deleteUserSession = await connection.startSession();
      try {
        await deleteUserSession.startTransaction();
        // delete all leagues of user, including associated matches, teams and invite codes
        const leagues = await LeagueModel.find<League>({ owner: user.sub });
        for (const league of leagues) {
          await MatchModel.deleteMany({ league: league._id });
          await TeamModel.deleteMany({ league: league._id });
          await InviteCodeModel.deleteMany({ league: league._id });
          await LeagueModel.findByIdAndDelete(league._id);
        }
        // delete all teams of user, including associated matches
        const teams = await TeamModel.find<Team>({ owner: user.sub });
        for (const team of teams) {
          await MatchModel.deleteMany({ $or: [{ homeTeam: team._id }, { awayTeam: team._id }] });
          await TeamModel.findByIdAndDelete(team._id);
          await LeagueModel.findByIdAndUpdate(team.league, { $pull: { participants: team.owner } });
        }
        // delete user in Auth0
        await managementClient.deleteUser({ id: user.sub });
        await deleteUserSession.commitTransaction();
        await deleteUserSession.endSession();
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error(err);
        await deleteUserSession.abortTransaction();
        await deleteUserSession.endSession();
        return res.status(400).json({ success: false });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
