import { model, Model, models, Schema } from 'mongoose';

const InviteCodeSchema = new Schema<InviteCodeDocument, InviteCodeModel>({
  code: {
    type: String,
    unique: true,
  },
  league: {
    type: Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
});

export interface InviteCode {
  _id?: string;
  code: string;
  league: string;
}

interface InviteCodeBaseDocument extends InviteCode, Document {
  _id?: string;
}

export interface InviteCodeDocument extends InviteCodeBaseDocument {}

export interface InviteCodeModel extends Model<InviteCodeDocument> {}

export default models.InviteCode ||
  model<InviteCodeDocument, InviteCodeModel>('InviteCode', InviteCodeSchema);
