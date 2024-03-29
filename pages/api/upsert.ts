import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    let admin = false;
    if (req.query.password == process.env.ADMIN_PASS) {
        admin = true
    }
    if (req.method !== "POST") {
        res.status(403).send("Invalid operation")
        return
    }
    const body = JSON.parse(req.body) as User
    if (!session && !admin) {
        res.status(401).send("Not logged in.")
        return
    }
    //@ts-ignore
    if (session?.user.id !== body.id && !admin) {
        res.status(401).send("Bad auth")
        return
    }
    //@ts-ignore
    if ((body.selfieURL?.trim() == "" || !body.selfieURL) && req.query.keepSelfies == undefined) body.selfieURL = null;
    await Promise.all([prisma.rejectInfo.upsert({
        where: {
            id: body.id
        },
        update: {},
        create: {
            id: body.id,
        }
    }), prisma.user.upsert({
        where: {
            id: body.id
        },
        update: body,
        create: {
            ...{
                age: 0,
                desc: "",
                discordTag: "",
                gender: "---",
                id: "",
                location: "",
                matchDesc: "",
                preferredAges: "",
                preferredGenders: "",
                radius: 0,
                selfieURL: null
            }, ...body
        }
    })])
    res.status(200).send("Successful")
}