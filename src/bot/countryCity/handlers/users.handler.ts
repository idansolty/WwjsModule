import { resolveNaptr } from "dns";
import { GroupParticipant } from "whatsapp-web.js";
import { User } from "../types/games.types";

// contains functions that help construct the users array
export class UserHandlerService {
    public updateUserInList(user: User, list: User[]): User[] {
        const index = list.findIndex(currentUser => currentUser.id === user.id);
        list[index] = user;

        return list;
    }

    public changeUserPoints(userId: string, list: User[], messageId: string, round: number, points: number, description?: string) {
        const user: User = list.find(currentUser => currentUser.id === userId);

        user.pointsLog.push(this.createPointLog(messageId, round, points, description));
        user.points += points;

        return this.updateUserInList(user, list);
    }

    public createUsersList(rawUsersObjs: GroupParticipant[]): User[] {
        const parsedUsersObjs = rawUsersObjs.map(this.createUser);

        return parsedUsersObjs;
    }

    public createUser(rawUserObj: GroupParticipant): User {
        return {
            id: rawUserObj.id._serialized,
            pointsLog: [this.createPointLog("init points", 0, 35, "init default points")],
            points: 35, // TODO: create default common const value
            sumCorrectAnswers: 0,
            sumWrongAnswers: 0
        }
    }

    public createPointLog(messageId: string, round: number, points: number, reason?: string) {
        return {
            messageId,
            round,
            reason,
            points
        };
    }
}