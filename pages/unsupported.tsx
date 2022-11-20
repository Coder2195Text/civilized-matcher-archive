import Head from "next/head";
import styles from "../styles/Home.module.css";
import { DiscordLoginButton } from "react-social-login-buttons";
import { signIn, useSession } from "next-auth/react";
import Router from "next/router";

export default function Home() {
  return (
    <div>
      <h1>
        Open the matchmaking link in the Safari broswer (iOS) or Chrome
        (Android).
      </h1>
      <br />
      <div>
        Copy and paste https://civilized-matcher.vercel.app/ into your broswer.
      </div>
      <h1>If you are getting this error on desktop, try logging out and in.</h1>
      <br />
      <div>Other solutions may be to use another device or broswer.</div>
    </div>
  );
}
