import Head from "next/head";
import { useSession } from "next-auth/react";
import Router from "next/router";
import Link from "next/link";
import { useState } from "react";
import { User } from "@prisma/client";

function renderPreview(user: User): Array<JSX.Element | string> {
  let array = [];
  array.push(
    `Username: ${user.discordTag}`,
    <br />,
    `Location: ${user.location}`,
    <br />,
    `Radius: ${user.radius}`,
    <br />,
    "Description: ",
    <br />,
    user.desc,
    <br />,
    "User description for match: ",
    <br />,
    user.matchDesc
  );
  return array;
}

function getSummary(matches: User[], accepted: boolean[]) {
  let finalMatches: User[] = [];
  for (let i = 0; i < matches.length; i++) {
    if (accepted[i]) {
      finalMatches.push(matches[i]);
    }
  }
  let index = 0;
  if (finalMatches.length == 0)
    return (
      <div>
        No matches found. You either couldn't fullfill both your and your
        matches gender and age requirements, or you rejected all your matches.
        Check back in a day or so.
      </div>
    );
  return (
    <div>
      <div>
        Choose the one you like most, then DM them. If it fails, come back to
        this website to get another match by "Find Your Match" on the home page.
        If you guys work out, come back here and press "Delete Form" on the home
        page.
      </div>
      <br />
      {finalMatches.map((u) => {
        index++;
        return (
          <div key={u.id}>
            {index})
            <br />
            Username: {u.discordTag} (If username doesn't work, try sending
            "&#60;&#64;{u.id}&#62;" in chat to find the new username, and if
            that person left the server, just find someone else)
            <br />
            Age: {u.age}
            <br />
            Preferred Ages: {u.preferredAges.split(";").join(", ")}
            <br />
            Gender: {u.gender}
            <br />
            Preferred Gender: {u.preferredGenders.split(";").join(", ")}
            <br />
            Location: {u.location}
            <br />
            Preferred Location Radius: {u.radius}
            <br />
            Description:
            <br />
            {u.desc}
            <br />
            Description for match:
            <br />
            {u.matchDesc}
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [response, setResponse] = useState<User>();
  const { status, data } = useSession();
  const [matches, setMatches] = useState<User[] | null>(null);
  const [accepted, setAccepted] = useState<boolean[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fetching, setFetching] = useState(false);
  if (status == "unauthenticated") {
    Router.push("/");
  }
  if (!fetching && !matches) {
    setFetching(true);
    fetch("/api/getMatches")
      .then((res) => res.json())
      .then(async (val: User[] | null) => {
        if (val == null) {
          Router.push("/form");
        } else {
          const res = (await fetch("/api/getResponse").then((res) =>
            res.json()
          )) as User;
          setResponse(res);
          setMatches(val);
          setAccepted(val.map(() => false));
        }
      });
  }
  if (fetching && matches && response) {
    return (
      <div className="w-100 text-center">
        <Head>
          <title>Matchmaking - Find a match</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {currentIndex !== matches.length ? (
          <div>
            <h1>Accept these matches?</h1>
            <div>{renderPreview(response!)}</div>
            <br />
            <div>{renderPreview(matches![currentIndex])}</div>
            <br />
            <div className="w-100 text-center d-flex justify-content-around">
              <button
                className="btn btn-primary"
                onClick={() => {
                  let acceptArr = [...accepted];
                  acceptArr[currentIndex] = true;
                  setAccepted(acceptArr);
                  setCurrentIndex(currentIndex + 1);
                }}
              >
                Accept
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setCurrentIndex(currentIndex + 1);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1>Results</h1>
            {getSummary(matches, accepted)}
            <br />
            <Link href="/dashboard">Return home</Link>
            <br />
          </div>
        )}
      </div>
    );
  } else
    return (
      <div className="w-100 text-center">
        <h1>Fetching your response and your matches... (may take a bit)</h1>
      </div>
    );
}
