import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { useEffect } from "react";


export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {

  useEffect(() => {
    function alertError(message: string | Event) {
      if (typeof window !== undefined) {
        alert("Error detected: " + message.toString());
      }
    }
    console.error = alertError;
    window.onerror = alertError;
  }, []);
  session = session as Session;
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
