import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import apiClient from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Lottie from "react-lottie";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import { HOST, SEARCH_CONTACTS_ROUTES } from "@/utils/constants";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
export const EmptyChatContainer = () => {
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [isVisible, setIsVisible] = useState(false);
  const { setSelectedChatType, setSelectedChatData } = useAppStore();

  const [openNewContactModel, setOpenNewContactModel] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);

  /* --------------------------------------------------------
     SEARCH CONTACTS API CALL
     Runs on every input change
  --------------------------------------------------------- */
  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length === 0) {
        setSearchedContacts([]);
        return;
      }

      const response = await apiClient.post(
        SEARCH_CONTACTS_ROUTES,
        { searchTerm },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.contacts) {
        setSearchedContacts(response.data.contacts);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const selectNewContact = (contact) => {
    setOpenNewContactModel(false);

    setSelectedChatType("contact");
    setSelectedChatData(contact);

    setSearchedContacts([]);
  };
  // Motivational quotes collection
  const motivationalQuotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.", author: "Roy T. Bennett" },
    { text: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Dream bigger. Do bigger.", author: "Unknown" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
    { text: "Little things make big days.", author: "Unknown" },
    { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
    { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
    { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
    { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
    { text: "Dream it. Wish it. Do it.", author: "Unknown" },
    { text: "Success is what happens after you have survived all your mistakes.", author: "Anora Lee" },
    { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
    { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
    { text: "You learn more from failure than from success. Don't let it stop you.", author: "Unknown" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { text: "If you can dream it, you can do it.", author: "Walt Disney" },
    { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
    { text: "The person who says it cannot be done should not interrupt the person who is doing it.", author: "Chinese Proverb" },
    { text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell" },
    { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
    { text: "The starting point of all achievement is desire.", author: "Napoleon Hill" },
    { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "All progress takes place outside the comfort zone.", author: "Michael John Bobak" },
    { text: "You may be disappointed if you fail, but you are doomed if you don't try.", author: "Beverly Sills" },
    { text: "Only the paranoid survive.", author: "Andy Grove" },
    { text: "It is better to fail in originality than to succeed in imitation.", author: "Herman Melville" },
    { text: "The road to success and the road to failure are almost exactly the same.", author: "Colin R. Davis" },
    { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
    { text: "A successful man is one who can lay a firm foundation with the bricks others have thrown at him.", author: "David Brinkley" },
    { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
    { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
    { text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
    { text: "Wherever you go, go with all your heart.", author: "Confucius" },
    { text: "We become what we think about most of the time, and that's the strangest secret.", author: "Earl Nightingale" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
    { text: "When I stand before God at the end of my life, I would hope that I would not have a single bit of talent left and could say, I used everything you gave me.", author: "Erma Bombeck" },
    { text: "Certain things catch your eye, but pursue only those that capture the heart.", author: "Ancient Indian Proverb" },
    { text: "First, have a definite, clear practical ideal; a goal, an objective. Second, have the necessary means to achieve your ends; wisdom, money, materials, and methods. Third, adjust all your means to that end.", author: "Aristotle" },
    { text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.", author: "H. Jackson Brown Jr." },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "An unexamined life is not worth living.", author: "Socrates" },
    { text: "Eighty percent of success is showing up.", author: "Woody Allen" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Winning isn't everything, but wanting to win is.", author: "Vince Lombardi" },
    { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
    { text: "Every child is an artist. The problem is how to remain an artist once he grows up.", author: "Pablo Picasso" },
    { text: "You can never cross the ocean until you have the courage to lose sight of the shore.", author: "Christopher Columbus" },
    { text: "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.", author: "Maya Angelou" },
    { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
    { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
    { text: "Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.", author: "Johann Wolfgang von Goethe" },
    { text: "The best revenge is massive success.", author: "Frank Sinatra" },
    { text: "People often say that motivation doesn't last. Well, neither does bathing. That's why we recommend it daily.", author: "Zig Ziglar" },
    { text: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin" },
    { text: "If you hear a voice within you say you cannot paint, then by all means paint and that voice will be silenced.", author: "Vincent Van Gogh" },
    { text: "There is only one way to avoid criticism: do nothing, say nothing, and be nothing.", author: "Aristotle" },
    { text: "Ask and it will be given to you; search, and you will find; knock and the door will be opened for you.", author: "Jesus" },
    { text: "The only person you should try to be better than is the person you were yesterday.", author: "Anonymous" },
    { text: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah Gray" },
    { text: "It is never too late to be what you might have been.", author: "George Eliot" },
  ];

  // Get quote based on the day of the year
  useEffect(() => {
    const getDailyQuote = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      const quoteIndex = dayOfYear % motivationalQuotes.length;
      setQuote(motivationalQuotes[quoteIndex]);
    };

    getDailyQuote();
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      <Dialog open={openNewContactModel} onOpenChange={setOpenNewContactModel}>
        <DialogContent
          className="
            bg-[#181920] border-none text-white 
            w-[90%] sm:w-[420px] 
            max-h-[85vh] 
            p-5 flex flex-col gap-4 
            overflow-y-auto rounded-xl
          "
        >
          {/* ---------- HEADER ---------- */}
          <DialogHeader>
            <DialogTitle>Select a Contact</DialogTitle>
            <DialogDescription className="text-gray-400">
              Search by email or name
            </DialogDescription>
          </DialogHeader>

          {/* ---------- SEARCH INPUT ---------- */}
          <Input
            placeholder="Search Contacts"
            className="rounded-lg p-4 bg-[#2c2e3b] border-none text-white"
            onChange={(e) => searchContacts(e.target.value)}
          />

          {/* ---------- SEARCH RESULTS LIST ---------- */}
          {searchedContacts.length > 0 && (
            <ScrollArea className="h-[250px] sm:h-[280px] overflow-y-auto pr-2">
              <div className="flex flex-col gap-4">
                {searchedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="
                      flex items-center gap-3 cursor-pointer 
                      hover:bg-[#2c2e3b]/40 p-2 rounded-lg transition
                    "
                    onClick={() => selectNewContact(contact)}
                  >
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                      {contact.image ? (
                        <AvatarImage
                          src={`${HOST}/${contact.image}`}
                          className="object-cover w-full h-full rounded-full"
                        />
                      ) : (
                        <div
                          className={`
                            uppercase h-12 w-12 flex items-center justify-center 
                            text-lg rounded-full border ${getColor(contact.color)}
                          `}
                        >
                          {contact.firstName
                            ? contact.firstName[0]
                            : contact.email[0]}
                        </div>
                      )}
                    </Avatar>

                    {/* Name + Email */}
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[200px]">
                        {contact.firstName && contact.lastName
                          ? `${contact.firstName} ${contact.lastName}`
                          : contact.email}
                      </span>

                      <span className="text-xs text-gray-400 truncate max-w-[200px]">
                        {contact.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* ---------- EMPTY STATE (LOTTIE ANIMATION) ---------- */}
          {searchedContacts.length === 0 && (
            <div className="flex flex-col flex-1 justify-center items-center mt-2">
              <Lottie
                isClickToPauseDisabled={true}
                height={100}
                width={100}
                options={animationDefaultOptions}
              />

              <p className="text-white/80 text-center mt-4 text-lg">
                Hi<span className="text-purple-500">!</span> Search new{" "}
                <span className="text-purple-500">contacts.</span>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <div className={`relative z-10 max-w-4xl w-full px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Welcome message */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-lg">Your daily dose of inspiration awaits</p>
        </div>

        {/* Quote card */}
        <div className="group relative">
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
          
          {/* Main card */}
          <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl p-10 border border-white/10 shadow-2xl">
            {/* Quote icon */}
            <div className="absolute -top-6 left-10 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50 animate-bounce" style={{animationDuration: '3s'}}>
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
              </svg>
            </div>

            {/* Quote text with typing effect feel */}
            <div className="mt-6 mb-8">
              <p className="text-white text-2xl md:text-3xl font-light leading-relaxed tracking-wide">
                {quote.text}
              </p>
            </div>

            {/* Author section with enhanced styling */}
            <div className="flex items-center gap-4 mt-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/20">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-purple-300 text-lg font-medium tracking-wider">
                  {quote.author}
                </span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            </div>

            {/* Decorative corner elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500/5 to-transparent rounded-tr-full"></div>
          </div>
        </div>

        {/* Daily refresh indicator */}
        <div className="mt-8 flex items-center justify-center gap-3 text-gray-500 text-sm">
          <svg className="w-5 h-5 animate-spin" style={{animationDuration: '3s'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Quote refreshes daily with new inspiration</span>
        </div>

        {/* Quick action hints */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "💬", text: "Start a conversation", desc: "Begin chatting" ,action: () => setOpenNewContactModel(true)},
            { icon: "🎯", text: "Set your goals", desc: "Track progress" ,action: () => {}},
            { icon: "⚡", text: "Stay motivated", desc: "Keep pushing",action: () => {} }
          ].map((item, i) => (
            <div 
              key={i} 
              className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{animationDelay: `${i * 0.2}s`}}
              onClick={item.action}
            >
              <div className="text-3xl mb-2" >{item.icon}</div>
              <div className="text-white font-medium">{item.text}</div>
              <div className="text-gray-400 text-sm">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmptyChatContainer;