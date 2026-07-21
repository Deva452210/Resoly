import { useState, useEffect } from 'react';

const WaitMessage = () => {
  const fullText = "I have deployed the backend on Render. On Render's free tier, if an application is inactive for 15 minutes, the initial response may be delayed by 30 to 50 seconds. Judges, please be patient as the server wakes up. I have put a lot of effort into this project! \u2764\ufe0f";
  const [text, setText] = useState('');

  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, 40); // typing speed
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="mt-6 p-4 bg-gray-900 border border-yellow-500/30 rounded-lg shadow-lg max-w-md w-full mx-auto">
      <p className="text-yellow-400 text-sm leading-relaxed">
        {text}
        <span className="animate-pulse">_</span>
      </p>
    </div>
  );
};

export default WaitMessage;
