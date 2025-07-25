import React from 'react';

const QuizBanner: React.FC = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-20 w-32 h-32 bg-blue-400 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-32 w-40 h-40 bg-green-400 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-orange-400 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-purple-400 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-12 gap-8 items-center">
        
        {/* Left Side - Empty for balance */}
        <div className="col-span-2"></div>

        {/* Center Content */}
        <div className="col-span-8 text-center px-4">
          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-12 bg-gradient-to-r from-blue-400 via-green-400 to-orange-400 bg-clip-text text-transparent leading-tight tracking-wider">
            QUIZ EVENT
          </h1>

          {/* Event Details - Vertical Layout */}
          <div className="space-y-8">
            {/* Organized By Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <h2 className="text-3xl font-bold mb-6 text-blue-300 tracking-wide">
                ORGANIZED BY
              </h2>
              <div className="flex items-center justify-center gap-8">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-blue-100 overflow-hidden">
                  <img 
                    src="/media/Khwopa.png" 
                    alt="KEC Logo" 
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div className="text-left">
                  <p className="text-3xl font-bold text-white mb-1">
                    Science and Humanities Department
                  </p>
                  <p className="text-xl text-blue-200">
                    Khwopa Engineering College
                  </p>
                </div>
              </div>
            </div>

            {/* Supported By Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <h2 className="text-3xl font-bold mb-6 text-green-300 tracking-wide">
                SUPPORTED BY
              </h2>
              <div className="flex items-center justify-center gap-8">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-blue-100 overflow-hidden">
                  <img 
                    src="/media/KSC.jpg" 
                    alt="KEC Logo" 
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div className="text-left">
                  <p className="text-3xl font-bold text-white">
                    Knowledge Sharing Circle (KSC)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Empty for balance */}
        <div className="col-span-2"></div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <div className="w-4 h-4 bg-blue-400 rounded-full opacity-60"></div>
        <div className="w-4 h-4 bg-green-400 rounded-full opacity-60"></div>
        <div className="w-4 h-4 bg-orange-400 rounded-full opacity-60"></div>
      </div>
    </div>
  );
};

export default QuizBanner;