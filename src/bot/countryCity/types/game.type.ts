import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from "./user.type";
import { AgileConstOptions } from "../common/consts";

export type WalletDocument = Game & Document;

@Schema()
export class Game {
    constructor(id, round, nextTime?, nextMessage?, options?, history?, users?) {
        this.id = id;
        this.round = round;
        this.nextTime = nextTime;
        this.nextMessage = nextMessage;
        if (!options) {
            this.options = new AgileConstOptions()
        } else {
            this.options = options;
        }
    }

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
    round: number

    @Prop()
    roundStart: Date

    @Prop()
    hasEnded: boolean

    @Prop()
    roundEnd: Date

    @Prop()
    message: string
}

