import { PrismaClient, User } from "@prisma/client";
import { Webhook } from "discord-webhook-node";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let admin = false;
    if (req.query.password == process.env.CUPID_PASSWORD) {
        admin = true
    }
    if (req.method !== "POST") {
        res.status(403).send("Invalid operation")
        return
    }
    if (!admin) {
        res.status(401).send("bad auth")
        return
    }
    let stat: number = 404;
    let resp = await fetch(process.env.DISCORD_WEBHOOK_URL as string, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ content: req.body })
    }).then(r => {
        stat = r.status
        return r.text()
    })
    res.status(stat).send(resp)
}
