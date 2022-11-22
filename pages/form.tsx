import Head from "next/head";
import styles from "../styles/Home.module.css";
import { signIn, signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useEffect, useState } from "react";
import SelectQuestion from "../forms/select";
import { User } from "@prisma/client";
import { DiscordProfile } from "next-auth/providers/discord";
import CheckBoxQuestion from "../forms/checkbox";
import LongAnswer from "../forms/longanswer";

const AGES = [13, 14, 15, 16, 17, 18].map((val) => String(val));

const GENDERS = [
  "Cis Male",
  "Cis Female",
  "Genderfluid",
  "Nonbinary",
  "Trans Male",
  "Trans Female",
  "Bigender",
];

export default function Form() {
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string>("no");
  //@ts-ignore
  const { status, accessToken } = useSession();
  const [errors, setErrors] = useState<string>("");
  const [data, setData] = useState<User | null>(null);

  if (status == "unauthenticated") {
    Router.push("/");
    return <></>;
  }

  if (progress == "no") {
    fetch("/api/getUser")
      .then((res) => {
        if (res.status > 400) Router.push("/unsupported");
        return res.json();
      })
      .then(async (value: DiscordProfile) => {
        const data = value;
        let response = (await fetch("/api/getResponse").then((res) =>
          res.json()
        )) as User;
        if (!response)
          response = {
            age: 13,
            desc: "",
            discordTag: "",
            gender: "Cis Male",
            id: value.id,
            location: "",
            matchDesc: "",
            preferredAges: "",
            preferredGenders: "",
            radius: 0,
          };
        response.discordTag = `${value.username}#${value.discriminator}`;
        setData(response);
        setProgress("done");
      });
    setProgress("in");
  }

  if (progress != "done") {
    return (
      <div className={styles.wrapper}>
        <h1>Loading Form...</h1>
      </div>
    );
  }
  return (
    <div className={styles.wrapper}>
      <Head>
        <title>Matchmaking - Form</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Form</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (submitting) return;
          if (data?.preferredAges == "") {
            setErrors("Select at least 1 preferred age.");
            return;
          }
          if (data?.preferredGenders == "") {
            setErrors("Selected at least 1 preferred gender.");
            return;
          }
          if (data?.location == "") {
            setErrors("Please give a location. ");
            return;
          }
          if (data?.desc == "") {
            setErrors("Please give your description");
            return;
          }
          if (data?.matchDesc == "") {
            setErrors("Please give a match description");
            return;
          }
          if (data?.discordTag == "undefined#undefined") {
            setErrors(
              "Your login might be corrupted. Log out and back in. Reason: Username was undefined#undefined. This could be resolved by opening the website in a broswer app rather clicking it inside the discord app."
            );
            return;
          }
          if (data?.preferredGenders.includes(data?.age)){
            if (!confirm("(AI Age Forget Detection): Do you really want to submit? You may have forgetten to put in your age. Press cancel to review your form.")){
              setErrors(`May have forgetten to put in age, since you are an ${data?.age} year old who prefers people of ages ${data?.preferredAges.replaceAll(";", ", ")}`)
              return;
            }
          }
          setSubmitting(true);
          fetch("/api/upsert", {
            method: "POST",
            body: JSON.stringify(data),
          })
            .then((res) => res.text())
            .then(() => {
              Router.push("/successful");
            })
            .catch(() => {
              setErrors("Couldn't submit.");
            });
        }}
      >
        <SelectQuestion
          value={String(data!.age)}
          question="Age: "
          name="age"
          options={AGES}
          update={(value: string) => {
            setErrors("");
            //@ts-ignore
            setData({ ...data, age: Number(value) });
          }}
        />
        <br />
        <CheckBoxQuestion
          value={data!.preferredAges}
          question="Ages that you can date: "
          name="preferredAges"
          options={AGES}
          update={(value: string[]) => {
            //@ts-ignore
            setData({ ...data, preferredAges: value.join(";") });
          }}
        />
        <br />
        <SelectQuestion
          value={data!.gender}
          question="Gender: "
          name="gender"
          options={GENDERS}
          update={(value: string) => {
            setErrors("");
            //@ts-ignore
            setData({ ...data, gender: value });
          }}
        />
        <br />
        <CheckBoxQuestion
          value={data!.preferredGenders}
          question="Genders that you can date: "
          name="preferredGenders"
          options={GENDERS}
          update={(value: string[]) => {
            //@ts-ignore
            setData({ ...data, preferredGenders: value.join(";") });
          }}
        />
        <br />
        <label htmlFor="text">Location: </label>
        <div>
          Valid Answer (are names of towns or cities): NYC, Troy NY, Paris,
          Tokyo, Newark NJ
          <br />
          Invalid Answer (are country names (small countries are allowed ig),
          vague locations, large provinces/states, or refusal to share): USA, Im
          not sharing my location cuz [some reason], Japan, South Argentina,
          Europe, California
          <br />
          Invalid forms will be deleted.
        </div>
        <input
          value={data!.location}
          type="text"
          name="location"
          maxLength={200}
          onChange={(e) => {
            let val = e.currentTarget.value;
            setErrors("");
            //@ts-ignore
            setData({
              ...data,
              location: val,
            });
          }}
          onBlur={(e) => {
            let val = e.currentTarget.value.trim();
            setErrors("");
            //@ts-ignore
            setData({
              ...data,
              location: val.length > 200 ? val.substring(0, 200) : val,
            });
          }}
        />
        <br />
        <br />
        <label htmlFor="text">Distance radius (km): </label>
        <div>Put 0 if u don't care about distance.</div>
        <input
          value={String(data!.radius)}
          type="number"
          min={0}
          max={24901}
          name="location"
          maxLength={200}
          onChange={(e) => {
            let val = Number(e.currentTarget.value);
            setErrors("");
            //@ts-ignore
            setData({
              ...data,
              radius: val > 24901 ? 24901 : val,
            });
          }}
        />
        <br />
        <br />
        <LongAnswer
          value={data!.desc}
          maxLength={2000}
          question="Describe yourself: "
          name="desc"
          update={(value: string) => {
            setErrors("");
            //@ts-ignore
            setData({ ...data, desc: value });
          }}
        />
        <br />
        <LongAnswer
          value={data!.matchDesc}
          maxLength={2000}
          question="Describe what you want from a match: "
          name="matchDesc"
          update={(value: string) => {
            setErrors("");
            //@ts-ignore
            setData({ ...data, matchDesc: value });
          }}
        />
        <div>{errors == "" ? "" : `Form error: ${errors}`}</div>
        <button type="submit">{submitting ? "Submitting" : "Submit"}</button>
      </form>
    </div>
  );
}
