import { Document, model, Model, models, Schema } from 'mongoose';
import { Team } from './TeamModel';

const MatchSchema = new Schema<MatchDocument, MatchModel>({
  league: {
    type: Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  homeTeam: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  homeScore: {
    type: Number,
    required: true,
  },
  awayTeam: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  awayScore: {
    type: Number,
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

export interface Match {
  _id?: string | Schema.Types.ObjectId;
  league: string | Schema.Types.ObjectId;
  homeTeam: string | Schema.Types.ObjectId;
  homeScore: number;
  awayTeam: string | Schema.Types.ObjectId;
  awayScore: number;
  createdDate?: Date;
  confirmed?: boolean;
}

interface MatchBaseDocument extends Match, Document {
  _id?: string;
}

export interface MatchDocument extends MatchBaseDocument {}

export interface MatchModel extends Model<MatchDocument> {}

export default models.Match || model<MatchDocument, MatchModel>('Match', MatchSchema);
