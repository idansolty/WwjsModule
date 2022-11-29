import { Injectable } from '@nestjs/common';
import { WwjsLogger } from 'src/Logger/logger.service';
import { Chat, GroupChat, GroupParticipant, Message } from 'whatsapp-web.js';
import { UserHandlerService } from './handlers/users.handler';
import { Game, GameHistory } from './types/games.types';

@Injectable()
export class CountryCityService {
    private readonly types = ["עיר", "מדינה", "חי", "צומח", "דומם", "שם של בן", "שם של בת", "מקצוע"];
    private readonly ONE_HOUR_MILISECONDS = 1000 * 60 * 60;
    private onlineGames: Game[];

    constructor(
        private readonly userHandlerService: UserHandlerService,
        private readonly Logger: WwjsLogger
    ) {
        this.onlineGames = [];
    }

    public getOnlineGames() {
        return this.onlineGames;
    }

    public async countryCity(groupName: string, chat: GroupChat) {
        this.onlineGames.push({ id: groupName, round: 0 });

        const choosenChat = chat;

        let randomTime = this.randomTimeTommorow()

        console.log("started countryCity!");
        while (true) {
            this.generateNextGame(groupName, randomTime);

            console.log(`waiting for time : ${randomTime.toLocaleDateString()} ${randomTime.toLocaleTimeString()}`)
            if (await this.waitTillStart(randomTime, groupName)) {
                return;
            }

            const thisOnlineGame = this.onlineGames.find(group => group.id === groupName);

            const sentMessage = await choosenChat.sendMessage(thisOnlineGame.nextMessage);

            await choosenChat.setMessagesAdminsOnly(false);

            this.pushHistoryInfo(groupName, thisOnlineGame.nextMessage);

            if (await this.waitTillEnd(new Date(new Date().getTime() + this.ONE_HOUR_MILISECONDS), groupName)) {
                return;
            };

            await choosenChat.setMessagesAdminsOnly(true);

            // check participants and remove failed
            const messages = await choosenChat.fetchMessages({ limit: 500 })

            const relevantMessages = messages.slice(messages.findIndex((searchedMessages => searchedMessages.id.id === sentMessage.id.id)) + 1)

            const allUsersInGroup = choosenChat.participants;

            this.calculatePoints(relevantMessages, allUsersInGroup, groupName);

            randomTime = this.randomTimeTommorow()
        }
    }

    calculatePoints(messages: Message[], users: GroupParticipant[], groupName: string) {
        const currentGame = this.onlineGames.find(game => game.id === groupName);
        let usersList = currentGame.users;

        const withoutDeleted = messages.filter((m) => m.type !== "revoked");

        const usersThatDidNotAnswer = users.filter((id) => !withoutDeleted.find(m => (m.author || m.from) === id.id._serialized))

        const mappedUserIds = usersThatDidNotAnswer.map(user => user.id._serialized);

        mappedUserIds.forEach((userId) => {
            usersList = this.userHandlerService.changeUserPoints(userId, usersList, "no message :(", currentGame.round, -2, "no message was sent in the given time!")
        })

        this.setUsersList(groupName, usersList);
    }

    generateNextGame(groupName, randomTime) {
        const letter = this.randomHebrewLetter();

        const type = this.types[this.randomNumber(0, this.types.length)]

        const message = `${type} שמתחיל באות ${letter}`;

        this.setNextTimeInfo(groupName, randomTime);
        this.setNextMessageInfo(groupName, message);
    }

    async waitTillStart(time, groupName) {
        const timeToWait = Math.max(1, new Date(time).getTime() - new Date().getTime());

        const iteration = (timeToWait / (this.ONE_HOUR_MILISECONDS)) * 100 + 1;

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

        const iteration = (timeToWait / (this.ONE_HOUR_MILISECONDS)) * 100 + 1;

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

    setNextTimeInfo(groupName, action) {
        const index = this.onlineGames.findIndex(group => group.id === groupName);
        this.onlineGames[index].nextTime = action;
    }

    setNextMessageInfo(groupName, message) {
        const index = this.onlineGames.findIndex(group => group.id === groupName);
        this.onlineGames[index].nextMessage = message;
    }

    pushHistoryInfo(groupName, action) {
        const parsedHistoryObject: GameHistory = {
            time: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            message: action
        };

        const index = this.onlineGames.findIndex(group => group.id === groupName);
        this.onlineGames[index].history ?
            this.onlineGames[index].history.push(parsedHistoryObject) :
            this.onlineGames[index].history = [parsedHistoryObject]
    }
}


