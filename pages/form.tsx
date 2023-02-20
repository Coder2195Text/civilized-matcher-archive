import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import Router from "next/router";
import { useRef, useState } from "react";
import SelectQuestion from "../forms/select";
import { User } from "@prisma/client";
import { DiscordProfile } from "next-auth/providers/discord";
import CheckBoxQuestion from "../forms/checkbox";
import LongAnswer from "../forms/longanswer";
import Button from "react-bootstrap/Button";
import Link from "next/link";
import { urlToImage } from "./_app";

const fileToB64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function range(start: number, stop: number, step = 1): number[] {
  return Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);
}
const AGES = [
  "---",
  ...range(
    Number(process.env.NEXT_PUBLIC_MIN_AGE),
    Number(process.env.NEXT_PUBLIC_MAX_AGE) + 1
  ),
].map((val) => String(val));

const GENDERS = [
  "---",
  "Cis Male",
  "Cis Female",
  "Genderfluid",
  "Nonbinary",
  "Trans Male",
  "Trans Female",
  "Bigender",
  "Demi girl",
  "Demi boy",
  "Agender",
];

const SEXES = ["---", "Guy", "Gal"];

export default function Form() {
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string>("no");
  //@ts-ignore
  const { status, accessToken } = useSession();
  const [errors, setErrors] = useState<string>("");
  const [data, setData] = useState<User | null>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  if (status == "unauthenticated") {
    signIn("discord");
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
            age: NaN,
            desc: "",
            discordTag: "",
            gender: "---",
            id: value.id,
            location: "",
            matchDesc: "",
            preferredAges: "",
            preferredGenders: "",
            radius: 0,
            formVersion: 1,
            sex: "---",
            preferredSex: "",
            //@ts-ignore
            selfieURL: null,
            matchedUser: null,
          };
        response.discordTag = `${value.username}#${value.discriminator}`;
        setData(response);
        setProgress("done");
      });
    setProgress("in");
  }

  if (progress != "done") {
    return (
      <div className="w-100 text-center">
        <h1>Loading Form...</h1>
      </div>
    );
  }
  return (
    <>
      <Head>
        <title>Matchmaking - Form</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Form</h1>
      {data?.formVersion == 0 ? (
        <h3>
          Alert: If you are seeing this message AND/OR were redirected here, you
          have to update your biological sex and sex preferences as part of the
          new update...
        </h3>
      ) : (
        ""
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (submitting) return;
          if (isNaN(data?.age!)) {
            setErrors("Select your age.");
            return;
          }
          if (data?.preferredAges == "") {
            setErrors("Select at least 1 preferred age.");
            return;
          }
          if (data?.sex == "---") {
            setErrors("Select your sex.");
            return;
          }
          if (data?.preferredSex == "") {
            setErrors("Select at least 1 preferred sex.");
            return;
          }
          if (data?.gender == "---") {
            setErrors("Select your gender.");
            return;
          }
          if (data?.preferredGenders == "") {
            setErrors("Select at least 1 preferred gender.");
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
          if (!data?.preferredAges.includes(String(data?.age))) {
            if (
              !confirm(
                "(AI Age Forget Detection): Do you really want to submit? You may have forgetten to put in your age. Press cancel to review your form."
              )
            ) {
              setErrors(
                `May have forgetten to put in age, since you are an ${data?.age
                } year old who prefers people of ages ${data?.preferredAges.replaceAll(
                  ";",
                  ", "
                )}`
              );
              return;
            }
          }

          if (data?.selfieURL) {
            if (!data?.selfieURL.startsWith("https://freeimage.host/i/")) {
              setErrors(
                "Invalid, image should be in format of https://freeimage.host/i/xxxxxxx (viewer link)"
              );
              return;
            }
            try {
              await fetch(urlToImage(data?.selfieURL));
            } catch {
              setErrors("Invalid selfie!!!");
              return;
            }
          }
          setSubmitting(true);

          fetch("/api/upsert", {
            method: "POST",
            body: JSON.stringify({ ...data, formVersion: 1 }),
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
            console.log(data);
            //@ts-ignore
            setData({ ...data, age: Number(value) });
          }}
        />
        <br />
        <CheckBoxQuestion
          value={data!.preferredAges}
          question="Ages that you can date: "
          name="preferredAges"
          options={AGES.slice(1)}
          update={(value: string[]) => {
            //@ts-ignore
            setData({ ...data, preferredAges: value.join(";") });
          }}
        />
        <br />
        <SelectQuestion
          value={data!.sex}
          question="Sex: "
          name="sex"
          options={SEXES}
          update={(value: string) => {
            setErrors("");
            //@ts-ignore
            setData({ ...data, sex: value });
          }}
        />
        <br />
        <CheckBoxQuestion
          value={data!.preferredSex}
          question="Sexes that you can date: "
          name="preferredSexes"
          options={SEXES.slice(1)}
          update={(value: string[]) => {
            //@ts-ignore
            setData({ ...data, preferredSex: value.join(";") });
          }}
        />
        <br />
        <div>
          Note for the below question, cis male and cis female refers to the
          default male and female that corresponds with your birth sex.
        </div>
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
          options={GENDERS.slice(1)}
          update={(value: string[]) => {
            //@ts-ignore
            setData({ ...data, preferredGenders: value.join(";") });
          }}
        />
        <br />
        <label htmlFor="text">Location: </label>
        <div>
          Put in your town/city, (ie, New York City, London, Troy NY,
          Martinsville, Virgina, US).
          <br />
          Are you not comfortable putting in your town? Put one that is at most
          50km away from you.
          <br />
          50km takes a person 10 hours to walk (as a reference)
          <br />
          <b>Get this part right, or no bf/gf for you.</b>
        </div>
        <input
          className="form-control d-inline w-auto"
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
          className="form-control d-inline w-auto"
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
        <br />
        <label htmlFor="text">Selfie (Optional): </label>
        <div>
          Use{" "}
          <Link href="https://freeimage.host/" target="_blank">
            THIS WEBSITE
          </Link>{" "}
          to upload your image. <br />
          Paste the url (should look like https://freeimage.host/i/xxxxxxx)
          here.
        </div>
        <br />
        <input
          className="form-control d-inline w-auto"
          ref={selfieRef}
          type="text"
          value={data?.selfieURL ? data?.selfieURL : ""}
          name="location"
          placeholder="No selfie detected."
          maxLength={400}
          onChange={(e) => {
            let val = e.currentTarget.value;
            setErrors("");
            //@ts-ignore
            setData({
              ...data,
              selfieURL: val,
            });
          }}
          onBlur={(e) => {
            let val = e.currentTarget.value.trim();
            setErrors("");
            //@ts-ignore
            setData({
              ...data,
              selfieURL: val.length > 400 ? val.substring(0, 400) : val,
            });
          }}
        />{" "}
        <Button
          type="button"
          onClick={() => {
            //@ts-ignore
            setData({
              ...data,
              selfieURL: null,
            });
          }}
          variant="danger"
        >
          Delete Selfie
        </Button>
        <br />
        <br />
        <div>{errors == "" ? "" : `Form error: ${errors}`}</div>
        <div className="w-100 d-flex justify-content-evenly pb-3">
          <Button
            type="button"
            onClick={() => {
              Router.push("/dashboard");
            }}
            variant="danger"
          >
            Discard Changes
          </Button>
          <Button type="submit" variant="primary">
            {submitting ? "Submitting" : "Submit"}
          </Button>
        </div>
      </form>
    </>
  );
}
