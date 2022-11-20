import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    //@ts-ignore
    const { accessToken } = await getSession({ req })
    if (!accessToken) {
        res.status(401).send("Not logged in.")
        return
    }
    let status: number = 200;
    let content: string = await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    }).then(val => {
        status = val.status;
        return val.json()
    })
    res.status(status).json(content)
}