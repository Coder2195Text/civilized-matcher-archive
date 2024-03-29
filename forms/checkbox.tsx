import { useState } from "react";

export default function CheckBoxQuestion({
  question,
  options,
  name,
  update,
  value,
}: {
  question: string;
  options: string[];
  name: string;
  update: Function;
  value: string;
}) {
  let obj: { [key: string]: boolean } = {};
  for (const option of options) {
    obj[option] = value.includes(option);
  }
  const [selected, setSelected] = useState<{ [keys: string]: boolean }>(obj);
  function getSelectedDict(dict: { [keys: string]: boolean }) {
    let arr = [];
    for (let item in dict) {
      if (dict[item] == true) arr.push(item);
    }
    return arr;
  }
  return (
    <div>
      <label htmlFor={name}>{question}</label>
      <br />
      {options.map((option) => (
        <span key={option}>
          <input
            className="form-check-input"
            type="checkbox"
            value={option}
            id={name + option}
            onChange={(e) => {
              const newVal = { ...selected, [option]: e.currentTarget.checked };
              setSelected(newVal);
              update(getSelectedDict(newVal));
            }}
            checked={value.includes(option)}
          />
          <label htmlFor={name + option}>{option}</label>
          <br />
        </span>
      ))}
    </div>
  );
}
