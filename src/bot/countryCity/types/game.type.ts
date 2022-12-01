import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from "./user.type";
import { AgileConstOptions } from "../common/consts";

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

    @Prop()
    options: AgileConstOptions 
}

export const WalletSchema = SchemaFactory.createForClass(Game);

export class GameHistory {
    @Prop()
    time: string

    @Prop()
    message: string
}

