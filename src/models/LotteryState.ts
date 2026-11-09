import mongoose, { Schema, Document } from 'mongoose';
import { LotteryState } from '@/lib/types';

export interface LotteryStateDocument extends LotteryState, Document {}

const PrizeSchema = new Schema(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true },
    badgeNumber: { type: String, required: true },
    title: { type: String, required: true },
    itemDescription: { type: String, required: true },
    quantity: { type: Number, required: true },
    digits: { type: Number, required: true },
    isAdjacent: { type: Boolean, default: false },
    adjacentSourceId: { type: String },
    slots: [{ type: String, default: null }],
  },
  { _id: false }
);

const LotteryStateSchema = new Schema(
  {
    year: { type: String, default: '2570' },
    title: { type: String, default: 'ประกาศผลการออกรางวัลสลากกาชาด ประจำปี พ.ศ. 2570' },
    organization: { type: String, default: 'เหล่ากาชาดจังหวัดศรีสะเกษ' },
    status: { type: String, enum: ['live', 'completed', 'paused'], default: 'live' },
    updatedAt: { type: String, default: () => new Date().toISOString() },
    prizes: [PrizeSchema],
  },
  { timestamps: true }
);

export const LotteryStateModel =
  mongoose.models.LotteryState ||
  mongoose.model<LotteryStateDocument>('LotteryState', LotteryStateSchema);

