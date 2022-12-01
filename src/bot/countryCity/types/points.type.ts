import { Prop } from "@nestjs/mongoose";

export class PointsLog {
    constructor(messageId, round, points, reason?) {
        this.messageId = messageId;
        this.round = round;
        this.points = points;
        this.reason = reason;
    }

    @Prop()
    messageId: string;

    @Prop()
    round: number

    @Prop()
    reason?: string;

    @Prop()
    points: number;
}