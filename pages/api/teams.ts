import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import dbConnect from '../../lib/dbConnect';
import InviteCodeModel, { InviteCode } from '../../models/InviteCodeModel';
import TeamModel, { Team } from '../../models/TeamModel';
import mongoose from 'mongoose';
import LeagueModel, { League } from '../../models/LeagueModel';
import Errors from '../../models/Errors';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { user } = getSession(req, res);

  const connection: mongoose.Connection = await dbConnect();

  switch (method) {
    case 'POST':
      const session = await connection.startSession();
      try {
        await session.startTransaction();
        const inviteCode = await InviteCodeModel.findOne<InviteCode>({
          code: req.body.inviteCode,
        });
        if (!inviteCode) {
          return res.status(404).end();
        }
        const league = await LeagueModel.findById<League>(inviteCode.league);
        if (league.participants.includes(user.sub)) {
          await session.abortTransaction();
          await session.endSession();
          return res.status(400).json({ success: false, error: Errors.USER_ALREADY_IN_LEAGUE });
        }
        const newTeam: Team = await TeamModel.create<Team>({
          league: inviteCode.league,
          name: req.body.name,
          fifaTeam: req.body.fifaTeam,
          owner: user.sub,
        });
        await LeagueModel.findByIdAndUpdate(inviteCode.league, {
          $push: { participants: user.sub },
        });
        await session.commitTransaction();
        await session.endSession();
        return res.status(201).json({ success: true, data: newTeam });
      } catch (error) {
        console.error('Error while processing GET', error);
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
