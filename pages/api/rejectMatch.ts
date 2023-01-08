import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    let admin = false;
    if (req.query.password) {
        if (req.query.password == process.env.ADMIN_PASS) {
            admin = true
            if (!req.query.id) {
                res.status(403).send("id?")
                return
            }
        } else {
            res.status(401).send("invalid password")
        }
    }
    if (!session && !admin) {
        res.status(401).send("Not logged in.")
        return
    }
    const data = await prisma.user.findUnique({
        where: {
            //@ts-ignore
            id: !admin ? session!.user.id : req.query.id as string
        },
        select: {
            id: true, matchedUser: true
        }
    })
    if (data && data.matchedUser) {
        await Promise.all([await prisma.user.updateMany({
            where: {
                id: {
                    in:
                        [data.id, data.matchedUser]

                }
            }, data:
            {
                matchedUser: null
            }
        }),
        await prisma.rejectInfo.update({
            where: {
                id: data.id
            },
            data: {
                rejectedBy: {
                    connect: {
                        //@ts-ignore
                        id: data.matchedUser
                    }
                }
            }
        })
        ])
    }
    res.status(200).send("Rejected match. You may close this tab now.")
}
