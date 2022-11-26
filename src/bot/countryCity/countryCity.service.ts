import { Injectable } from '@nestjs/common';

@Injectable()
export class CountryCityService {
    private types = ["עיר", "מדינה", "חי", "צומח", "דומם", "שם של בן", "שם של בת", "מקצוע"];
    private readonly ONE_HOUR_MILISECONDS = 1000 * 60 * 60;
    private onlineGames = []

    public getOnlineGames() {
        return this.onlineGames;
    }

    public async countryCity(groupName, chat) {
        this.onlineGames.push({ id: groupName });

        const choosenChat = chat;

        let randomTime = this.randomTimeTommorow()

        console.log("started countryCity!");
        while (true) {
            const letter = this.randomHebrewLetter();

            const type = this.types[this.randomNumber(0, this.types.length)]

            const message = `${type} שמתחיל באות ${letter}`;

            // this.setNextTimeInfo(groupName, randomTime);
            // setNextMessageInfo(groupName, message);

            console.log(`waiting for time : ${randomTime.toLocaleDateString()} ${randomTime.toLocaleTimeString()}`)
            if (await this.waitTillStart(randomTime, groupName)) {
                return;
            }

            const object = this.onlineGames.find(group => group.id === groupName);

            const sentMessage = await choosenChat.sendMessage(object.nextMessage);

            await choosenChat.setMessagesAdminsOnly(false);

            // this.pushHistoryInfo(groupName, object.nextMessage);

            if (await this.waitTillEnd(new Date(new Date().getTime() + this.ONE_HOUR_MILISECONDS), groupName)) {
                return;
            };

            await choosenChat.setMessagesAdminsOnly(true);

            // check participants and remove failed
            const messages = await choosenChat.fetchMessages({ limit: 500 })

            const relevantMessages = messages.slice(messages.findIndex((searchedMessages => searchedMessages.id.id === sentMessage.id.id)) + 1)

            const uniqMessages = relevantMessages.filter((m) => m.type !== "revoked");

            const allUsersInGroup = choosenChat.participants.filter((user) => !user.isAdmin);

            const usersThatDidNotAnswer = allUsersInGroup.filter((id) => !uniqMessages.find(m => (m.author || m.from) === id.id._serialized))

            const mappedIds = usersThatDidNotAnswer.map(user => user.id._serialized);

            // TODO : change logic to add points and not to remove people
            // shouldRemove.push(mappedIds);

            console.log(mappedIds);

            randomTime = this.randomTimeTommorow()
        }
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
}


