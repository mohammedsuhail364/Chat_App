import { animationDefaultOptions } from "@/lib/utils";
import Lottie from "react-lottie";
import { useState, useEffect } from "react";

export const EmptyChatContainer = () => {
  const [quote, setQuote] = useState({ text: "", author: "" });

  // Motivational quotes collection
  const motivationalQuotes = [
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs",
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
    },
    {
      text: "It does not matter how slowly you go as long as you do not stop.",
      author: "Confucius",
    },
    {
      text: "Everything you've ever wanted is on the other side of fear.",
      author: "George Addair",
    },
    {
      text: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.",
      author: "Roy T. Bennett",
    },
    {
      text: "I learned that courage was not the absence of fear, but the triumph over it.",
      author: "Nelson Mandela",
    },
    {
      text: "The only impossible journey is the one you never begin.",
      author: "Tony Robbins",
    },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    {
      text: "Success doesn't just find you. You have to go out and get it.",
      author: "Unknown",
    },
    {
      text: "The harder you work for something, the greater you'll feel when you achieve it.",
      author: "Unknown",
    },
    { text: "Dream bigger. Do bigger.", author: "Unknown" },
    {
      text: "Don't stop when you're tired. Stop when you're done.",
      author: "Unknown",
    },
    {
      text: "Wake up with determination. Go to bed with satisfaction.",
      author: "Unknown",
    },
    {
      text: "Do something today that your future self will thank you for.",
      author: "Sean Patrick Flanery",
    },
    { text: "Little things make big days.", author: "Unknown" },
    {
      text: "It's going to be hard, but hard does not mean impossible.",
      author: "Unknown",
    },
    { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
    {
      text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
      author: "Unknown",
    },
    {
      text: "The key to success is to focus on goals, not obstacles.",
      author: "Unknown",
    },
    { text: "Dream it. Wish it. Do it.", author: "Unknown" },
    {
      text: "Success is what happens after you have survived all your mistakes.",
      author: "Anora Lee",
    },
    {
      text: "Don't be afraid to give up the good to go for the great.",
      author: "John D. Rockefeller",
    },
    {
      text: "Hardships often prepare ordinary people for an extraordinary destiny.",
      author: "C.S. Lewis",
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
    },
    {
      text: "Don't let yesterday take up too much of today.",
      author: "Will Rogers",
    },
    {
      text: "You learn more from failure than from success. Don't let it stop you.",
      author: "Unknown",
    },
    {
      text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
      author: "Zig Ziglar",
    },
    { text: "If you can dream it, you can do it.", author: "Walt Disney" },
    {
      text: "A person who never made a mistake never tried anything new.",
      author: "Albert Einstein",
    },
    {
      text: "The person who says it cannot be done should not interrupt the person who is doing it.",
      author: "Chinese Proverb",
    },
    {
      text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.",
      author: "Colin Powell",
    },
    {
      text: "I find that the harder I work, the more luck I seem to have.",
      author: "Thomas Jefferson",
    },
    {
      text: "The starting point of all achievement is desire.",
      author: "Napoleon Hill",
    },
    {
      text: "Success is walking from failure to failure with no loss of enthusiasm.",
      author: "Winston Churchill",
    },
    {
      text: "All progress takes place outside the comfort zone.",
      author: "Michael John Bobak",
    },
    {
      text: "You may be disappointed if you fail, but you are doomed if you don't try.",
      author: "Beverly Sills",
    },
    { text: "Only the paranoid survive.", author: "Andy Grove" },
    {
      text: "It is better to fail in originality than to succeed in imitation.",
      author: "Herman Melville",
    },
    {
      text: "The road to success and the road to failure are almost exactly the same.",
      author: "Colin R. Davis",
    },
    {
      text: "I attribute my success to this: I never gave or took any excuse.",
      author: "Florence Nightingale",
    },
    {
      text: "You miss 100% of the shots you don't take.",
      author: "Wayne Gretzky",
    },
    {
      text: "Whether you think you can or you think you can't, you're right.",
      author: "Henry Ford",
    },
    {
      text: "I have not failed. I've just found 10,000 ways that won't work.",
      author: "Thomas Edison",
    },
    {
      text: "A successful man is one who can lay a firm foundation with the bricks others have thrown at him.",
      author: "David Brinkley",
    },
    {
      text: "No one can make you feel inferior without your consent.",
      author: "Eleanor Roosevelt",
    },
    {
      text: "Opportunities don't happen. You create them.",
      author: "Chris Grosser",
    },
    {
      text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
      author: "Roy T. Bennett",
    },
    { text: "Wherever you go, go with all your heart.", author: "Confucius" },
    {
      text: "We become what we think about most of the time, and that's the strangest secret.",
      author: "Earl Nightingale",
    },
    {
      text: "The only person you are destined to become is the person you decide to be.",
      author: "Ralph Waldo Emerson",
    },
    {
      text: "Go confidently in the direction of your dreams. Live the life you have imagined.",
      author: "Henry David Thoreau",
    },
    {
      text: "When I stand before God at the end of my life, I would hope that I would not have a single bit of talent left and could say, I used everything you gave me.",
      author: "Erma Bombeck",
    },
    {
      text: "Certain things catch your eye, but pursue only those that capture the heart.",
      author: "Ancient Indian Proverb",
    },
    {
      text: "First, have a definite, clear practical ideal; a goal, an objective. Second, have the necessary means to achieve your ends; wisdom, money, materials, and methods. Third, adjust all your means to that end.",
      author: "Aristotle",
    },
    {
      text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.",
      author: "H. Jackson Brown Jr.",
    },
    {
      text: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb",
    },
    { text: "An unexamined life is not worth living.", author: "Socrates" },
    { text: "Eighty percent of success is showing up.", author: "Woody Allen" },
    {
      text: "Your time is limited, so don't waste it living someone else's life.",
      author: "Steve Jobs",
    },
    {
      text: "Winning isn't everything, but wanting to win is.",
      author: "Vince Lombardi",
    },
    {
      text: "I am not a product of my circumstances. I am a product of my decisions.",
      author: "Stephen Covey",
    },
    {
      text: "Every child is an artist. The problem is how to remain an artist once he grows up.",
      author: "Pablo Picasso",
    },
    {
      text: "You can never cross the ocean until you have the courage to lose sight of the shore.",
      author: "Christopher Columbus",
    },
    {
      text: "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.",
      author: "Maya Angelou",
    },
    {
      text: "Either you run the day, or the day runs you.",
      author: "Jim Rohn",
    },
    {
      text: "The two most important days in your life are the day you are born and the day you find out why.",
      author: "Mark Twain",
    },
    {
      text: "Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.",
      author: "Johann Wolfgang von Goethe",
    },
    { text: "The best revenge is massive success.", author: "Frank Sinatra" },
    {
      text: "People often say that motivation doesn't last. Well, neither does bathing. That's why we recommend it daily.",
      author: "Zig Ziglar",
    },
    {
      text: "Life shrinks or expands in proportion to one's courage.",
      author: "Anaïs Nin",
    },
    {
      text: "If you hear a voice within you say you cannot paint, then by all means paint and that voice will be silenced.",
      author: "Vincent Van Gogh",
    },
    {
      text: "There is only one way to avoid criticism: do nothing, say nothing, and be nothing.",
      author: "Aristotle",
    },
    {
      text: "Ask and it will be given to you; search, and you will find; knock and the door will be opened for you.",
      author: "Jesus",
    },
    {
      text: "The only person you should try to be better than is the person you were yesterday.",
      author: "Anonymous",
    },
    {
      text: "Build your own dreams, or someone else will hire you to build theirs.",
      author: "Farrah Gray",
    },
    {
      text: "It is never too late to be what you might have been.",
      author: "George Eliot",
    },
  ];

  // Get quote based on the day of the year
  useEffect(() => {
    const getDailyQuote = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      // Use day of year to pick a consistent quote for the day
      const quoteIndex = dayOfYear % motivationalQuotes.length;
      setQuote(motivationalQuotes[quoteIndex]);
    };

    getDailyQuote();
  }, []);

  return (
    <>
      {/* 
        -------------------------------------------------------
        EMPTY CHAT PLACEHOLDER
        -------------------------------------------------------
        • Shows when no chat is selected
        • Hidden only on small screens (mobile)
        • Visible on md+ screens as a filler UI
      */}
      <div
        className="
          hidden md:flex 
          flex-1 
          flex-col items-center justify-center 
          bg-[#1c1d25]
          transition-all duration-700
          text-center
          px-4
        "
      >
        {/* Lottie Animation */}
        <Lottie
          isClickToPauseDisabled={true}
          height={200}
          width={200}
          options={animationDefaultOptions}
        />
        {/* Daily Motivational Quote */}
        <div
          className="
          mt-16 max-w-3xl w-full
          px-10 py-8
          bg-white/5
          border-l-4 border-purple-500
          rounded-xl
          backdrop-blur-md
          shadow-2xl
          transition-all duration-300
          hover:bg-white/8
          relative
        "
        >
          {/* Quote Icon */}
          <div
            className="
            absolute -top-4 left-8
            w-12 h-12
            bg-gradient-to-br from-purple-500 to-purple-600
            rounded-full
            flex items-center justify-center
            shadow-lg shadow-purple-500/50
          "
          >
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
            </svg>
          </div>

          {/* Quote text */}
          <p
            className="
            text-white 
            text-xl sm:text-2xl
            font-light
            leading-relaxed
            mb-6
            mt-4
            tracking-wide
          "
          >
            {quote.text}
          </p>

          {/* Author section */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <p
              className="
              text-purple-300
              text-base sm:text-lg
              font-medium
              tracking-wider
            "
            >
              {quote.author}
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          </div>

          {/* Corner accent */}
          <div
            className="
            absolute bottom-0 right-0
            w-24 h-24
            bg-gradient-to-tl from-purple-500/10 to-transparent
            rounded-tl-full
          "
          ></div>
        </div>

        {/* Subtle hint text */}
        <div
          className="
          mt-6
          flex items-center gap-2
          text-white/50
          text-sm
        "
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </>
  );
};
