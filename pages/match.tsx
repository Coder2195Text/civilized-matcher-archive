import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import Router from "next/router";
import Link from "next/link";
import { useState } from "react";
import { User } from "@prisma/client";
import Button from "react-bootstrap/Button";
import { urlToImage } from "./_app";

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
    user.matchDesc,
    user.selfieURL ? (
      <>
        <br />
        Selfie:
        <br />
        <img
          src={urlToImage(user.selfieURL)}
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
          }}
          alt=""
        />
      </>
    ) : (
      <></>
    )
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
            {u.formVersion == 0 ? (
              "(Old form, doesn't have sex requirements.)"
            ) : (
              <>
                Sex: {u.sex}
                <br />
                Preferred Sexes: {u.preferredSex.split(";").join(", ")}
              </>
            )}
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
            <br />
            {u.selfieURL ? (
              <>
                <br />
                Selfie:
                <br />
                <img
                  src={urlToImage(u.selfieURL)}
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                  }}
                  alt=""
                />
              </>
            ) : (
              []
            )}
          </div>
        );
      })}
    </div>
  );
}

function BlackListButton({
  confirmCount,
  onConfirm,
}: {
  confirmCount: number;
  onConfirm: Function;
}) {
  const [count, setCount] = useState(confirmCount);
  const [actionState, setActionState] = useState(0);
  return (
    <Button
      variant="dark"
      onClick={async () => {
        if (count !== 0) {
          setCount(count - 1);
          return;
        }
        setActionState(1);
        await onConfirm();
        setCount(confirmCount);
        setActionState(0);
      }}
    >
      {count == 0
        ? actionState == 0
          ? "Click to blacklist"
          : "Blacklisting..."
        : `Click ${count} times to confirm blacklist`}
    </Button>
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
    signIn("discord");
    return <></>;
  }
  if (!fetching && !matches) {
    setFetching(true);
    fetch("/api/getResponse")
      .then((res) => res.json())
      .then(async (val: User | null) => {
        if (val == null || val.formVersion == 0) {
          Router.push("/form");
        } else {
          const res = (await fetch("/api/getMatches").then((res) =>
            res.json()
          )) as User[];
          setResponse(val);
          setMatches(res);
          setAccepted(res.map(() => false));
        }
      });
  }
  if (fetching && matches && response) {
    return (
      <>
        <Head>
          <title>Matchmaking - Find a Bitch</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {currentIndex !== matches.length ? (
          <div>
            <h1>
              Accept bitch {currentIndex + 1}/{matches.length}?
            </h1>
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
            <h4>
              Blacklist is permanent (DO THIS ONLY IF YOU HAVE DATED THEM
              BEFORE)
            </h4>
            <BlackListButton
              confirmCount={5}
              onConfirm={async () => {
                await fetch(`/api/blacklist?id=${matches![currentIndex].id}`);
                setCurrentIndex(currentIndex + 1);
              }}
            />
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
      </>
    );
  } else
    return (
      <>
        <h1>Fetching your response and your matches... (may take a bit)</h1>
      </>
    );
}
