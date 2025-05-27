import { useEffect, useState } from 'react';

const Footer = () => {
  const [starCount, setStarCount] = useState(0);

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/rocknwa/Batch-Transfer-Dapp');
        const data = await response.json();
        setStarCount(data.stargazers_count);
      } catch (error) {
        console.error('Error fetching star count:', error);
      }
    };

    fetchStarCount();
  }, []);

  return (
    <footer className="w-full bg-black border-t border-gray-700 mt-8 py-4">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex justify-between items-start">
          {/* Left side */}
          <div>
            <div className="text-gray-400 text-xs mb-4 pt-1 pb-1 pl-3 pr-3 bg-gray-900 max-w-[200px]">
              Free open source web3 template
            </div>
            <div className="text-white mb-4 text-2xl font-bold font-sans">
              Build your own Token MultiSender
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/rocknwa/Batch-Transfer-Dapp/fork"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-xs"
              >
                Fork and Build Your Own
              </a>
              <div className="relative inline-flex items-center group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700 hover:bg-white hover:text-black transition-colors text-white text-xs">
                  <svg viewBox="0 0 16 16" width="16" height="16" className="fill-current">
                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                  </svg>
                  Star
                </button>
                
                <div className="relative w-20 h-8">
                  <svg viewBox="0 0 80 32" className="w-full h-full">
                    <path
                      d="M 12 2 H 72 Q 78 2 78 8 V 24 Q 78 30 72 30 H 12 Q 6 30 6 24 V 20 L 0 16 L 6 12 V 8 Q 6 2 12 2"
                      fill="black"
                      stroke="#374151"
                      strokeWidth="1"
                      className="drop-shadow-sm"
                    />
                    <text x="42" y="16" textAnchor="middle" dominantBaseline="middle" className="text-sm" fill="white">
                      {starCount}
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-end gap-4">
            {/* Made with love section */}
            <div className="flex items-center gap-2 pt-8">
              <span className="text-gray-400 font-sans">MADE WITH</span>
              <span className="text-white text-xl font-sans">♥</span>
              <span className="text-gray-400 font-sans">BY</span>
              <div className="flex items-center">
                <img
                  alt="crystal ball"
                  src="https://aquamarine-rare-firefly-756.mypinata.cloud/ipfs/QmWxXdsCk61hVfoCGvJJe8cYEJ2bMZo8eHstENNfVKheL8"
                  width={20}
                  height={20}
                  className="object-contain"
                />
                <span className="text-xl font-semibold ml-2 leading-none font-sans text-white">
                  Therock
                </span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center">
              <span className="mr-4 text-gray-400 pt-4 font-sans">Follow me on</span>
              <div className="flex items-center gap-3 pt-4 text-white">
                <a href="https://t.me/Tech_Scorpion" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7.42 11.83c-1.25-.62-1.25-1.63 0-2.25L21.86.34c1-.66 1.85-.31 2.25.45zm-5.16 3.82l-8.82 8.32L9 19.62l4.89-3.62 7.08-6.59-2.43-2.3z"/>
                  </svg>
                </a>
                <a href="https://x.com/ani_therock" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/therock-ani-13336224b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;