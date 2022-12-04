export default function SelectQuestion({
  question,
  options,
  name,
  update,
  value,
}: {
  question: string;
  options: any[];
  name: string;
  update: Function;
  value: string;
}) {
  return (
    <div>
      <label htmlFor={name}>{question}</label>
      <select
        className="form-select w-auto d-inline"
        value={value}
        name={name}
        id={name}
        onChange={(event) => update(event.currentTarget.value)}
      >
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      <br />
    </div>
  );
}
