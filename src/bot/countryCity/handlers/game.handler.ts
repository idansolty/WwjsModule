import { resolveNaptr } from "dns";
import { GroupParticipant } from "whatsapp-web.js";
import { AgileConstOptions } from "../common/consts";
import { Game, GameHistory } from "../types/game.type";
import { PointsLog } from "../types/points.type";
import { User } from "../types/user.type";

// contains functions that help construct the users array
export class GameHandlerService {
    public updateGameInList(game: Game, list: Game[]): Game[] {
        const index = list.findIndex(currentUser => currentUser.id === game.id);
        list[index] = game;

        return list;
    }

    public updateLogInHistory(log: GameHistory, list: GameHistory[]): GameHistory[] {
        const index = list.findIndex(currentUser => currentUser.round === log.round);
        list[index] = log;

        return list;
    }

    public startNextRound(game: Game, list: Game[]): Game[] {
        // handle history
        const currentRoundHistoryLog: GameHistory = {
            round: game.round + 1,
            roundStart: game.nextTime,
            hasEnded: false,
            roundEnd: undefined,
            message: "action"
        };

        if (game.round > 0) {
            const lastRound = game.history.find((historyLog) => historyLog.round === game.round);

            lastRound.hasEnded = true;
            lastRound.roundEnd = new Date();

            game.history = this.updateLogInHistory(lastRound, game.history);
        }
        
        if (game.history) {
            game.history.push(currentRoundHistoryLog);
        } else {
            game.history = [currentRoundHistoryLog];
        }

        return this.updateGameInList(game, list);
    }

    public createNewGame(id: string, options?: AgileConstOptions): Game {
        return new Game(id, 0, undefined, undefined, options);
    }

    public setNextTimeInfo(newTime: Date, game: Game, list: Game[]): Game[] {
        game.nextTime = newTime;

        return this.updateGameInList(game, list);
    }

    public setNextMessageInfo(newMessage: string, game: Game, list: Game[]): Game[] {
        game.nextMessage = newMessage;

        return this.updateGameInList(game, list);
    }
}