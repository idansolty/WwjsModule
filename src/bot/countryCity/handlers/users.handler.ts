import { PointsLog } from "../types/points.type";
import { User } from "../types/user.type";

// contains functions that help construct the users array
export class UserHandlerService {
    public updateUserInList(user: User, list: User[]): User[] {
        const index = list.findIndex(currentUser => currentUser.id === user.id);
        list[index] = user;

        return list;
    }

    public createNonExistingUsers(toCheck: string[], existing: User[]) {
        const existingIds = existing.map((user) => user.id);
        const idsThatDontExist = toCheck.filter((userId) => existingIds.includes(userId));

        if (!idsThatDontExist.length) {
            return existing;
        }

        const newUsers = this.createUsersList(idsThatDontExist);

        const newList = existing.concat(newUsers);
        return newList;
    }

    public changeUserPoints(userId: string, list: User[], messageId: string, round: number, points: number, description?: string, extraInfo?: any) {
        const user: User = list.find(currentUser => currentUser.id === userId);

        const logOnThatMessage = user.pointsLog.find((log) => log.messageId === messageId);

        if (logOnThatMessage) {
            // if the reason changed, change log
            if (logOnThatMessage.reason !== description) {
                user.pointsLog = user.pointsLog.filter((log) => log.messageId !== messageId);
                user.points -= logOnThatMessage.points;
            } else {
                return list;
            }
        }

        user.pointsLog.push(new PointsLog(messageId, round, points, description, extraInfo));
        user.points += points;

        return this.updateUserInList(user, list);
    }

    public createUsersList(usersIds: string[]): User[] {
        const parsedUsersObjs = usersIds.map((id) => this.createUser(id));

        return parsedUsersObjs;
    }

    public createUser(id: string): User {
        const firstPointsLog = new PointsLog("init points", 0, 35, "init default points");

        const user = new User(id, [firstPointsLog], 35, 0, 0)

        return user;
    }
}