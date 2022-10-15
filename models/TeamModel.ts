import { Document, model, Model, models, Schema } from 'mongoose';

const TeamSchema = new Schema<TeamDocument, TeamModel>({
  league: {
    type: Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  fifaTeam: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
});

export interface Team {
  _id?: string;
  league: string | Schema.Types.ObjectId;
  name: string;
  fifaTeam: string;
  owner: string;
  createdDate?: Date;
  confirmed?: boolean;
}

interface TeamBaseDocument extends Team, Document {
  _id?: string;
}

export interface TeamDocument extends TeamBaseDocument {}

export interface TeamModel extends Model<TeamDocument> {}

export default models.Team || model<TeamDocument, TeamModel>('Team', TeamSchema);
