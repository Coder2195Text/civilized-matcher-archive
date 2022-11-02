import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()
    const session = await getSession({ req });
    let admin = false;
    if (req.query.password == process.env.ADMIN_PASS){
        admin = true
        if (!req.query.id){
            res.status(403).send("id?")
            return
        }
    }
    if (!session && !admin) {
        res.status(401).send("Not logged in.")
        return
    }
    const data = await prisma.user.findUnique({
        where: {
            id: !admin ? session.user.id : req.query.id as string
        }
    })
    res.status(200).json(data)
}
