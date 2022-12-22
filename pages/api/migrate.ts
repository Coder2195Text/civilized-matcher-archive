import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const prisma = new PrismaClient()

    await prisma.user.updateMany({
        where: {
            discordTag: {
                contains: "#"
            }
        },
        data: {
            preferredSex: ""
        }
    })
    res.status(200).send("Successful")
}