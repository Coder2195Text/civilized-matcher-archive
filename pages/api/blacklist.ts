import { PrismaClient, RejectInfo } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    let admin = false;
    //@ts-ignore
    if (!(session && session?.user?.id)) {
        res.status(401).send("Not logged in.")
        return
    }
    let id = req.query.id
    if (!id || typeof id !== "string") {
        res.status(403).send("id?")
        return
    }

    let [match, data] = await Promise.all([
        prisma.rejectInfo.findUnique({
            where: {
                id
            }
        }),
        prisma.rejectInfo.findUnique({
            where: {
                //@ts-ignore
                id: session.user.id
            }
        })
    ])

    if (!data) {
        res.status(403).send("error with rejecter")
        return
    }
    if (!match) {
        res.status(403).send("error with rejectee")
        return
    }

    await prisma.rejectInfo.update({
        where: {
            id
        },
        data: {
            rejectedBy: {
                connect: {
                    //@ts-ignore
                    id: session.user.id
                }
            }
        }
    })

    res.status(200).send(`Blacklisted ${id}. You may close this tab now.`)
}
