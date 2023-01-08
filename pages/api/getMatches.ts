import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    let admin = false;
    let cupid = false;
    let adminID;
    if (req.query.cupid !== undefined) {
        cupid = true;
    }
    if (req.query.password) {
        if (req.query.password == process.env.ADMIN_PASS || req.query.password == process.env.CUPID_PASSWORD) {
            admin = true
            adminID = req.query.id as string | undefined
            if (!adminID) {
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
    //@ts-ignore
    let id = adminID ? adminID : session?.user?.id;
    const blackListed: string[] = []
    const [response, rejectInfo] = await Promise.all([
        prisma.user.findUnique({
            where: {
                id: id
            }
        }),
        prisma.rejectInfo.findUnique({
            where: {
                id: id
            },
            select: {
                rejectedBy: {
                    select: {
                        id: true
                    }
                },
                rejectedUsers: {
                    select: {
                        id: true
                    }
                }
            }
        })
    ])
    if (rejectInfo) {
        blackListed.push(...rejectInfo.rejectedBy.map((e) => e.id), ...rejectInfo.rejectedUsers.map((e) => e.id))
    }
    if (!response) {
        res.status(200).json(null)
        return
    }
    let data = await prisma.user.findMany({
        where: {
            AND: [
                {
                    id: {
                        notIn: [id, ...blackListed]
                    },
                    gender: {
                        in: response.preferredGenders.split(";")
                    },
                    preferredGenders: {
                        contains: response.gender
                    },
                    age: {
                        in: response.preferredAges.split(";").map(a => Number(a))
                    },
                    preferredAges: {
                        contains: String(response.age)
                    },
                },
                {
                    OR: [
                        {
                            formVersion: 0
                        }, {
                            preferredSex: {
                                contains: response.sex
                            },
                            sex: {
                                in: response.preferredSex.split(";")
                            },
                        }
                    ]
                }
            ]
        }
    })

    if (cupid) {
        data = data.filter((u) => u.matchedUser == null)
    }
    res.status(200).json(data)
}