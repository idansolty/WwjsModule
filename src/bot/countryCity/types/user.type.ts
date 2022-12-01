import { Prop } from "@nestjs/mongoose";
import { PointsLog } from "./points.type";

export class User {
    constructor(id, pointsLog, points, sumCorrectAnswers, sumWrongAnswers) {
        this.id = id
        this.pointsLog = pointsLog
        this.points = points
        this.sumCorrectAnswers = sumCorrectAnswers
        this.sumWrongAnswers = sumWrongAnswers
    }

    @Prop()
    id: string;

    @Prop()
    pointsLog: PointsLog[]

    @Prop()
    points: number;

    @Prop()
    sumCorrectAnswers: number;

    @Prop()
    sumWrongAnswers: number;
}