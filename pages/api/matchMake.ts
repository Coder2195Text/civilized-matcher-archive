import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";


const prisma = new PrismaClient()
const channels = [
    "https://discord.com/api/webhooks/1052344659298484296/P4RvXZl8uWBhkQO-2hBrM833v8fql1IPv79yg5-xzSfzmdH1u7V59MskWO7NlEGp0PpL",
    "https://discord.com/api/webhooks/1061028879080374322/y33W-0zGJGvho0-Z7zxJYBXLLgDSV-_hUi0urLZ3O9P5NWWJ-IKdhoHCM_i7YcuUO1AN"
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let admin = false;
    if (req.query.password == process.env.CUPID_PASSWORD) {
        admin = true
    }
    if (req.method !== "POST") {
        res.status(403).send("Invalid operation")
        return
    }

    if (!(Array.isArray(req.body.users) && req.body.users.length == 2 && typeof req.body.reason == "string")) {
        res.status(403).send("invalid params")
    }
    if (!admin) {
        res.status(401).send("bad auth")
        return
    }
    let mainMatch = (await prisma.user.findUnique({ where: { id: req.body.users[0] }, select: { matchedUser: true } }))

    let users = await prisma.user.updateMany({
        where: {
            id: {
                in: req.body.users
            }
        }, data: {
            matchedUser: null
        }
    })

    if (users.count !== 2) {
        res.status(403).send("Something glitched with the connections of users.")
    }

    if (mainMatch?.matchedUser) {
        await prisma.user.update({
            where: { id: mainMatch.matchedUser },
            data: {
                matchedUser: null
            }
        })
    }

    await prisma.user.update({
        where: { id: req.body.users[0] }, data: {
            matchedUser: req.body.users[1]
        }
    })
    await prisma.user.update({
        where: { id: req.body.users[1] }, data: {
            matchedUser: req.body.users[0]
        }
    })
    let resp = await Promise.all(channels.map(url => fetch(url as string, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
            content: `<@${req.body.users[0]}> and <@${req.body.users[1]}>, you have been matched!!!\n**Reason:**\n> ${req.body.reason}\nNext time don't be lazy and find yourself a match through self-matchmaking.\n**Due to sharing matchmaking across servers**\nIf you are having trouble looking up their usernames:\nhttps://discordlookup.com/user/${req.body.users[0]}\nhttps://discordlookup.com/user/${req.body.users[1]}
        
        :warning: **REJECT MATCH** :warning:\nClick the link below if you don't like your match.\n${process.env.NEXTAUTH_URL}/api/rejectMatch`
        })
    })));
    res.status(200).send("Sent")
}
