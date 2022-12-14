import Head from "next/head";
import { useSession } from "next-auth/react";
import Router from "next/router";
import Link from "next/link";
import { useState } from "react";
import { User } from "@prisma/client";
import Button from "react-bootstrap/Button";

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

function getSummary(
  matches: User[],
  accepted: boolean[],
  userID: string,
  setResultState: Function,
  password: string,
  response: User,
  resultState: number
) {
  let finalMatches: User[] = [];
  for (let i = 0; i < matches.length; i++) {
    if (accepted[i]) {
      finalMatches.push(matches[i]);
    }
  }
  let index = 0;
  if (finalMatches.length == 0)
    return (
      <>
        No matches found.
        <br />
        <Link
          href="/cupidMatch"
          className="link-primary"
          onClick={() => {
            Router.reload();
          }}
        >
          Matchmake another!!!
        </Link>
      </>
    );
  return (
    <div>
      <h3>Target person below:</h3>
      Username: {response.discordTag}
      <br />
      Age: {response.age}
      <br />
      Preferred Ages: {response.preferredAges.split(";").join(", ")}
      <br />
      Gender: {response.gender}
      <br />
      Preferred Gender: {response.preferredGenders.split(";").join(", ")}
      <br />
      Location: {response.location}
      <br />
      Preferred Location Radius: {response.radius}
      <br />
      Description:
      <br />
      {response.desc}
      <br />
      Description for match:
      <br />
      {response.matchDesc}
      <br />
      <h3>Choose the one that fits best the most... </h3>
      {finalMatches.map((u) => {
        index++;
        return (
          <div key={u.id}>
            {index})
            <br />
            Username: {u.discordTag}{" "}
            <Button
              variant="primary"
              disabled={resultState == 1}
              onClick={async () => {
                setResultState(1);
                await fetch(`/api/postMessage?password=${password}`, {
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  method: "POST",
                  body: `"<@${userID}> and <@${u.id}>, you are lazy people who didn't bother finding your own matches.\nNow I have matched you (UGH ANNOYING HUMANS), if your match fails, go matchmake yourself next time in the link inside <#1041081886031753233>."`,
                });
                setResultState(2);
              }}
            >
              Choose this person as a match
            </Button>
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
  const [user, setUser] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [errors, setErrors] = useState<string | undefined>(undefined);
  const { status, data } = useSession();
  const [matches, setMatches] = useState<User[] | null>(null);
  const [accepted, setAccepted] = useState<boolean[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [resultState, setResultState] = useState(0); //0 for not matched, 1 for pending, 2 for done
  if (status == "unauthenticated") {
    Router.push("/");
  }
  if (resultState == 2) {
    return (
      <>
        <h1>Done!!!</h1>
        <Link
          href="/cupidMatch"
          className="link-primary"
          onClick={() => {
            Router.reload();
          }}
        >
          Matchmake another!!!
        </Link>
        <br />
        <Link href="/dashboard" className="link-primary">
          Return Home
        </Link>
      </>
    );
  }
  if (!user || !password)
    return (
      <>
        <h1>Cupid Matchmaking</h1>
        Want to help with cupid? DM me to get cupid role in order to get the
        password. The password is in the Server Category, in a channel called
        "cupid-stuff"
        <br />
        <label htmlFor="text">Password: </label>
        <input
          className="form-control d-inline w-auto"
          type="password"
          name="location"
          maxLength={50}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors("");
          }}
        />
        <br />
        <Link
          href="https://www.youtube.com/watch?v=XyPam80YK_Q"
          className="link-primary"
        >
          (How to get discord id?)
        </Link>
        <br />
        <label htmlFor="text">User id: </label>
        <input
          className="form-control d-inline w-auto"
          type="text"
          name="location"
          maxLength={22}
          onChange={() => {
            setErrors(undefined);
          }}
          onBlur={async (e) => {
            e.target.value = e.target.value.trim();
            setErrors("Fetching...");
            let res = await fetch(
              `/api/getResponse?password=${password}&id=${e.target.value}`
            ).then((res) => res);
            if (res.status == 401) {
              setErrors("Error: Wrong password...");
              return;
            }
            let obj = (await res.json()) as User;
            console.log(obj);
            if (!obj) {
              setErrors("Error: User doesnt exist...");
              return;
            }
            setResponse(obj);
            let val = await fetch(
              `/api/getMatches?password=${password}&id=${e.target.value}`
            ).then((res) => res.json());

            setMatches(val);
            setAccepted(val!.map(() => false));
            setFetching(true);
            setUser(e.target.value);
          }}
        />
        {errors ? <div>{errors}</div> : ""}
        <br />
      </>
    );
  if (fetching && matches && response) {
    return (
      <>
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
            <div className="w-100 text-center d-flex justify-content-around pb-3">
              <Button
                variant="primary"
                onClick={() => {
                  let acceptArr = [...accepted];
                  acceptArr[currentIndex] = true;
                  setAccepted(acceptArr);
                  setCurrentIndex(currentIndex + 1);
                }}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setCurrentIndex(currentIndex + 1);
                }}
              >
                Reject
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h1>Results</h1>
            {getSummary(
              matches,
              accepted,
              user,
              setResultState,
              password,
              response,
              resultState
            )}
            <br />
            <Link href="/dashboard">Return home</Link>
            <br />
          </div>
        )}
      </>
    );
  } else
    return (
      <>
        <h1>Fetching your response and your matches... (may take a bit)</h1>
      </>
    );
}
