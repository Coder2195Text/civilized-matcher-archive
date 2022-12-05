import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import Router from "next/router";
import Button from "react-bootstrap/Button";

export default function Home() {
  const { status } = useSession();
  if (status == "authenticated") {
    Router.push("/dashboard");
    return <></>;
  }
  return (
    <>
      <Head>
        <title>Matchmaking - Login</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Matchmaking. Refined. Accurate. Reliable.</h1>
      <div>
        Tired of old form matchmaking?
        <br />
        Tired of a month of waiting?
        <br />
        Well, if you are already a member of my discord server, that great
        matchmaking is HERE.
        <br />
        Our matchmaking is secure, because you cannot fake someone else's
        application due to our Discord OAuth. Try it out now!!!
        <br />
        <Button
          onClick={() => {
            signIn("discord");
          }}
          variant="primary"
        >
          Login with Discord
        </Button>
      </div>
    </>
  );
}
