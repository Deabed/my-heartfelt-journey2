import { useState } from "react";

interface Props {
  onUnlock: (dateInput: string) => void;
}

const UnlockGate = ({ onUnlock }: Props) => {
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onUnlock(date);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="glass p-8 rounded-2xl text-center w-[320px]">
        <h2 className="text-white text-2xl mb-6 font-amiri">
          أدخلي تاريخ علاقتنا ❤️
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="21/03/2024"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-center mb-4 text-black"
          />

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg transition"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default UnlockGate;
