export default function LongAnswer({
  question,
  name,
  update,
  maxLength,
  value,
}: {
  question: string;
  name: string;
  update: Function;
  maxLength: number;
  value: string;
}) {
  return (
    <div>
      <label htmlFor={name}>{question}</label>
      <br />
      <textarea
        maxLength={maxLength}
        name={name}
        value={value}
        style={{
          resize: "vertical",
          width: "90vw",
        }}
        onChange={(e) => {
          let val = e.currentTarget.value.trim();
          update(val.length > maxLength ? val.substring(0, maxLength) : val);
        }}
      ></textarea>
    </div>
  );
}
