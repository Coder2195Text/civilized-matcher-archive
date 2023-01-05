import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()
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
    if (body.selfieURL?.trim() == "" || !body.selfieURL) body.selfieURL = null;
    await prisma.user.upsert({
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
            }, ...body
        }
    })
    res.status(200).send("Successful")
}