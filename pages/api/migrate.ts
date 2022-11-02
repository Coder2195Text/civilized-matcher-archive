import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()
    let admin = false;
    if (req.query.password == process.env.ADMIN_PASS){
        admin = true
    }
    if (req.method !== "POST"){
        res.status(403).send("Invalid operation")
        return
    }
    const body = JSON.parse(req.body) as User
    if (!admin){
        res.status(401).send("Not logged in.")
        return
    }
    await prisma.user.upsert({
        where: {
            id: body.id
        },
        update: {},
        create: body
    })
    res.status(200).send("Successful")
}