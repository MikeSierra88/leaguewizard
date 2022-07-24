import { Document, Model, model, models, Schema } from "mongoose";
import { InviteCode } from './InviteCodeModel';

const LeagueSchema = new Schema<LeagueDocument, LeagueModel>({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  participants: {
    type: [String],
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  inviteCode: {
    type: Schema.Types.ObjectId,
    ref: 'InviteCode'
  },
});

export interface League {
  _id?: string;
  name: string;
  owner: string;
  participants: string[];
  createdDate: Date;
  inviteCode?: InviteCode;
}

interface LeagueBaseDocument extends League, Document {
  _id?: string;
  name: string;
  owner: string;
  participants: string[];
  createdDate: Date;
  inviteCode?: InviteCode;
}

export interface LeagueDocument extends LeagueBaseDocument {
}

export interface LeagueModel extends Model<LeagueDocument> {
}

export default models.League || model<LeagueDocument, LeagueModel>("League", LeagueSchema);
