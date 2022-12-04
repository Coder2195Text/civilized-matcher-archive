import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()
    if (req.query.password !== process.env.ADMIN_PASS) {
        res.status(401).send("bad auth")
        return
    }
    const data = (await prisma.user.findMany({
        select: {
            id: true
        }
    })).map(u => u.id);
    res.status(200).json(data)
}