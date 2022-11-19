import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const prisma = new PrismaClient();
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
