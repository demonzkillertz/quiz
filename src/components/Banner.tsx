import React from 'react';

const Banner: React.FC = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Subtle Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/public/media/college-image.jpg)',
          filter: 'brightness(0.8) contrast(1.1)'
        }}
      />
      
      {/* Light Transparent Overlay */}
      <div className="absolute inset-0 bg-white/50" />
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold text-black mb-6 tracking-wide drop-shadow-md">
            KHWOPA
          </h1>
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-8 drop-shadow-md">
            Quiz Competition
          </h2>
        </div>
        
        {/* Year */}
        <div className="mb-12">
          <span className="text-4xl md:text-5xl font-medium text-black tracking-wider drop-shadow-md">
            २०८२
          </span>
        </div>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-center text-gray-900 max-w-2xl leading-relaxed font-medium drop-shadow-md">
          A battle of knowledge and intellect
        </p>
      </div>
    </div>
  );
};

export default Banner;