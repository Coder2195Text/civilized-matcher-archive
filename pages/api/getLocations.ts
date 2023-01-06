import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.query.password !== process.env.ADMIN_PASS) {
        res.status(401).send("bad auth");
        return;
    }
    const data = (
        await prisma.user.findMany({
            select: {
                id: true,
                location: true,
                discordTag: true
            },
        })
    ).map((u) => {
        return `${u.id}: ${u.location}`;
    }).join("\n");
    res.status(200).send(data);
}
