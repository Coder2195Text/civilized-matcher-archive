import { PrismaClient, User } from "@prisma/client";
import { Webhook } from "discord-webhook-node";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()
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
    await fetch(process.env.DISCORD_WEBHOOK_URL as string, {
        method: "POST",
        body: JSON.stringfy({content:req.body})
    })
    res.status(200).send("Successful")
}
