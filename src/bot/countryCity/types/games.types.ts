import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type WalletDocument = Game & Document;

@Schema()
export class Game {
    @Prop()
    id: string;

    @Prop()
    round: number;

    @Prop()
    nextTime?: Date;

    @Prop()
    nextMessage?: string;

    @Prop()
    history?: GameHistory[]

    @Prop()
    users?: User[]
}

export const WalletSchema = SchemaFactory.createForClass(Game);

export class GameHistory {
    @Prop()
    time: string

    @Prop()
    message: string
}

export class User {
    @Prop()
    id: string;

    @Prop()
    pointsLog: PointLog[]

    @Prop()
    points: number;

    @Prop()
    sumCorrectAnswers: number;

    @Prop()
    sumWrongAnswers: number;
}

export class PointLog {
    @Prop()
    messageId: string;

    @Prop()
    round: number

    @Prop()
    reason?: string;

    @Prop()
    points: number;
}