import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import "bootswatch/dist/minty/bootstrap.min.css";
import SSRProvider from "react-bootstrap/SSRProvider";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  session = session as Session;
  return (
    <SSRProvider>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </SSRProvider>
  );
}
