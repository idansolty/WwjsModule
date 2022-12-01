import { Injectable } from '@nestjs/common';
import { WwjsLogger } from 'src/Logger/logger.service';
import { Chat, GroupChat, GroupParticipant, Message, MessageTypes } from 'whatsapp-web.js';
import { AgileConstOptions } from './common/consts';
import { GameHandlerService } from './handlers/game.handler';
import { UserHandlerService } from './handlers/users.handler';
import { Game, GameHistory } from './types/game.type';

@Injectable()
export class CountryCityService {
    private readonly types = ["עיר", "מדינה", "חי", "צומח", "דומם", "שם של בן", "שם של בת", "מקצוע"];
    private readonly ONE_HOUR_MILISECONDS = 1000 * 60 * 60;
    private onlineGames: Game[];

    constructor(
        private readonly userHandlerService: UserHandlerService,
        private readonly gameHandlerService: GameHandlerService,
        private readonly Logger: WwjsLogger
    ) {
        this.onlineGames = [];
    }

    public getOnlineGames() {
        return this.onlineGames;
    }

    public async countryCity(groupName: string, chat: GroupChat) {
        this.onlineGames.push({ id: groupName, round: 0, options: new AgileConstOptions() });

        const choosenChat = chat;

        this.generateNextGame(groupName);

        console.log("started countryCity!");
        while (true) {
            const thisOnlineGame = this.onlineGames.find(group => group.id === groupName);

            this.Logger.logInfo(`${groupName} is waiting for time : ${thisOnlineGame.nextTime.toLocaleDateString()} ${thisOnlineGame.nextTime.toLocaleTimeString()}`);
            console.log(`waiting for time : ${thisOnlineGame.nextTime.toLocaleDateString()} ${thisOnlineGame.nextTime.toLocaleTimeString()}`)
            if (await this.waitTillStart(thisOnlineGame.nextTime, groupName)) {
                return;
            }

            this.onlineGames = this.gameHandlerService.startNextRound(thisOnlineGame, this.onlineGames);

            this.Logger.logInfo(`${groupName} is starting round ${thisOnlineGame.round}`);

            const sentMessage = await choosenChat.sendMessage(thisOnlineGame.nextMessage);

            await choosenChat.setMessagesAdminsOnly(false);

            this.generateNextGame(groupName);

            if (await this.waitTillEnd(new Date(new Date().getTime() + this.ONE_HOUR_MILISECONDS), groupName)) {
                return;
            };

            await choosenChat.setMessagesAdminsOnly(true);

            const messages = await choosenChat.fetchMessages({ limit: 500 })

            const relevantMessages = messages.slice(messages.findIndex((searchedMessages => searchedMessages.id.id === sentMessage.id.id)) + 1)

            const allUsersInGroup = choosenChat.participants;

            this.calculateRoundPoints(relevantMessages, allUsersInGroup, groupName);
        }
    }

    calculateRoundPoints(messages: Message[], users: GroupParticipant[], groupName: string) {
        const currentGame = this.onlineGames.find(game => game.id === groupName);
        let usersList = currentGame.users;

        usersList = this.userHandlerService.createNonExistingUsers(users.map((user) => user.id._serialized), usersList);

        const withoutDeleted = messages.filter((m) => m.type !== MessageTypes.REVOKED);

        const usersThatDidNotAnswer = users.filter((id) => !withoutDeleted.find(m => (m.author || m.from) === id.id._serialized))

        const mappedUserIds = usersThatDidNotAnswer.map(user => user.id._serialized);

        if (currentGame.options.POINTS_LOST_WHEN_NOT_ANSWERING) {
            mappedUserIds.forEach((userId) => {
                this.Logger.logInfo(`${userId} has lost ${Math.abs(currentGame.options.POINTS_LOST_WHEN_NOT_ANSWERING)} points because he did not answer at the given time!`)
                usersList = this.userHandlerService.changeUserPoints(userId, usersList, "no message :(", currentGame.round, -currentGame.options.POINTS_LOST_WHEN_NOT_ANSWERING, "no message was sent in the given time!")
            })
        }

        this.setUsersList(groupName, usersList);
    }

    caculateBadAnswer(groupName, userId, messageId, reason?) {
        const currentGame = this.onlineGames.find(game => game.id === groupName);

        this.userHandlerService.changeUserPoints(
            userId,
            currentGame.users,
            messageId,
            currentGame.round,
            -currentGame.options.POINTS_LOST_WHEN_BAD_ANSWER,
            `${userId} has lost ${Math.abs(currentGame.options.POINTS_LOST_WHEN_BAD_ANSWER)} points because he answered a bad answer! ${reason ? `(${reason})` : ""}`
        )
    }

    caculateGoodAnswer(groupName, userId, messageId, reason?) {
        const currentGame = this.onlineGames.find(game => game.id === groupName);

        this.userHandlerService.changeUserPoints(
            userId,
            currentGame.users,
            messageId,
            currentGame.round,
            currentGame.options.POINTS_GAINED_WHEN_GOOD_ANSWER,
            `${userId} has lost ${Math.abs(currentGame.options.POINTS_GAINED_WHEN_GOOD_ANSWER)} points because he answered a good answer! ${reason ? `(${reason})` : ""}`
        )
    }

    generateNextGame(groupName) {
        const relevantGame = this.onlineGames.find(group => group.id === groupName);

        const randomTime = this.randomTimeTommorow();

        const letter = this.randomHebrewLetter();

        const type = this.types[this.randomNumber(0, this.types.length)]

        const message = `${type} שמתחיל באות ${letter}`;

        this.onlineGames = this.gameHandlerService.setNextTimeInfo(randomTime, relevantGame, this.onlineGames);
        this.onlineGames = this.gameHandlerService.setNextMessageInfo(message, relevantGame, this.onlineGames);
    }

    async waitTillStart(time, groupName) {
        const timeToWait = Math.max(1, new Date(time).getTime() - new Date().getTime());

        const iteration = Math.floor((timeToWait / (this.ONE_HOUR_MILISECONDS)) * 100 + 1);

        const object = this.onlineGames.find(group => group.id === groupName);

        for (let i in [...Array(iteration).keys()]) {
            await this.delay(timeToWait / (iteration))

            if (!object) {
                return true;
            }

            if (object.nextTime < new Date()) {
                return;
            }
        }

        if (object.nextTime > new Date()) {
            return this.waitTillStart(time, groupName);
        }
    }

    async waitTillEnd(time, groupName) {
        const timeToWait = Math.max(1, new Date(time).getTime() - new Date().getTime());

        const iteration = Math.floor((timeToWait / (this.ONE_HOUR_MILISECONDS)) * 100 + 1);

        const object = this.onlineGames.find(group => group.id === groupName);

        for (let i in [...Array(iteration).keys()]) {
            await this.delay(timeToWait / (iteration))

            if (!object) {
                return true;
            }
        }
    }

    unicodeToChar(text) {
        return text.replace(/\\u[\dA-F]{4}/gi,
            function (match) {
                return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
            });
    }

    delay(time) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time);
        });
    }

    randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    randomHebrewLetter() {
        let number = this.randomNumber(1488, 1514);

        if ([1509, 1507, 1503, 1501, 1498].includes(number)) {
            number += 1;
        }

        return this.unicodeToChar(`\\u0${(number).toString(16).toUpperCase()}`);;
    }

    randomNumber(start, end) {
        return parseInt(start + Math.random() * (end - start));
    }

    randomTimeTommorow() {
        const now = new Date();

        // TOMMOROW BETWEEN 7 TO 23->
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7)
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23)

        // IN THE NEXT 10 SECONDS ->
        // const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds() + 10)
        // const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds() + 20)

        return this.randomDate(start, end);
    }

    setUsersList(groupName, users) {
        const index = this.onlineGames.findIndex(group => group.id === groupName);
        this.onlineGames[index].users = users;
    }
}


