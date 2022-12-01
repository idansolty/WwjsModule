import { Prop } from "@nestjs/mongoose";

export class PointsLog {
    constructor(messageId, round, points, reason?, extraInfo?) {
        this.messageId = messageId;
        this.round = round;
        this.points = points;
        this.reason = reason;
        this.extraInfo = extraInfo;
    }

    @Prop()
    messageId: string;

    @Prop()
    round: number

    @Prop()
    reason?: string;

    @Prop()
    points: number;

    extraInfo?: Record<string, any>;
}