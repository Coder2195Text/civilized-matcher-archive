import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()
    const session = await getSession({ req });
    let admin = false;
    let adminID;
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
    const response = await prisma.user.findUnique({
        where: {
            id: id
        }
    })
    if (!response) {
        res.status(200).json(null)
        return
    }
    const data = await prisma.user.findMany({
        where: {
            AND: [
                {
                    id: {
                        notIn: [id]
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
                    }
                },
                {
                    OR: [
                        {
                            sex: {
                                equals: "---"
                            }
                        }, {
                            preferredSex: {
                                contains: response.sex
                            },
                            sex: {
                                in: response.preferredAges.split(";")
                            },
                        }
                    ]
                }
            ]
        }
    })
    res.status(200).json(data)
}