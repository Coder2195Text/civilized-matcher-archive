import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()
    const session = await getSession({ req })
    let admin = false;
    let adminID;
    if (req.query.password == process.env.ADMIN_PASS){
        admin = true
        adminID = req.query.id as string | undefined
        if (!adminID){
            res.status(403).send("id?")
            return
        }
    }
    if (!session && !admin) {
        res.status(401).send("Not logged in.")
        return
    }
    let id = adminID ? adminID : session?.user.id
    const data = await prisma.user.delete({
        where: {
            id: id
        }
    })
    res.status(200).json(data)
}