import { NextApiRequest, NextApiResponse } from "next";

const channels = [
    "https://discord.com/api/webhooks/1052344659298484296/P4RvXZl8uWBhkQO-2hBrM833v8fql1IPv79yg5-xzSfzmdH1u7V59MskWO7NlEGp0PpL",
    "https://discord.com/api/webhooks/1061028879080374322/y33W-0zGJGvho0-Z7zxJYBXLLgDSV-_hUi0urLZ3O9P5NWWJ-IKdhoHCM_i7YcuUO1AN"
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let admin = false;
    if (req.query.password == process.env.CUPID_PASSWORD) {
        admin = true
    }
    if (req.method !== "POST") {
        res.status(403).send("Invalid operation")
        return
    }
    if (!admin) {
        res.status(401).send("bad auth")
        return
    }
    let stat: number = 404;
    let resp = await Promise.all(channels.map(url => fetch(url as string, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ content: req.body })
    })));
    res.status(200).send("Sent")
}
