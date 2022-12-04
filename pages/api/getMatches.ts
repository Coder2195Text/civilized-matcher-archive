import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()
    const session = await getSession({ req });

    if (!session) {
        res.status(401).send("Not logged in.")
        return
    }
    const response = await prisma.user.findUnique({
        where: {
            //@ts-ignore
            id: session?.user?.id
        }
    })
    if (!response) {
        res.status(200).json(null)
        return
    }
    const data = await prisma.user.findMany({
        where: {
            id: {
                //@ts-ignore
                notIn: [session.user.id]
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
        }
    })
    res.status(200).json(data)
}