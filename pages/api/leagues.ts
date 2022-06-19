import dbConnect from '../../lib/dbConnect';
import LeagueModel from '../../models/LeagueModel';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import mongoose from 'mongoose';
import TeamModel from '../../models/TeamModel';

export default withApiAuthRequired(async function handler(req, res) {
  const { method } = req;
  const { user } = getSession(req, res);

  const connection: mongoose.Connection = await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const leagues = await LeagueModel.find(
          {
            participants: { $all: [user.sub] },
          },
          '-inviteCode -participants'
        );
        return res.status(200).json({ success: true, data: leagues });
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    case 'POST':
      const session = await connection.startSession();
      try {
        await session.startTransaction();
        console.log(req.body);
        const league = await LeagueModel.create(req.body.league);
        const team = await TeamModel.create({
          ...req.body.team,
          league: league._id,
          confirmed: true,
        });
        await session.commitTransaction();
        await session.endSession();
        return res.status(201).json({ success: true, data: { league, team } });
      } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
