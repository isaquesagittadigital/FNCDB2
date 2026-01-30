
import React from 'react';

interface LogoProps {
  className?: string;
  dark?: boolean;
}

export const LogoIcon: React.FC<LogoProps> = ({ className = "w-12 h-12", dark = false }) => {
  return (
    <img
      src={dark ? "/assets/logos/LogoEscura.svg" : "/assets/logos/LogoBranca.svg"}
      alt="FNCD Capital Logo"
      className={className}
    />
  );
};

export const LogoFull: React.FC<{ dark?: boolean; className?: string }> = ({ dark = false, className = "h-8" }) => {
  if (!dark) {
    return (
      <img
        src="/assets/logos/LogoFonteBranca.png"
        alt="FNCD Capital"
        className={className}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <LogoIcon className="w-8 h-8" dark={dark} />
      <span className={`text-2xl font-medium tracking-tight text-[#002B49]`}>
        FNCD Capital
      </span>
    </div>
  );
};

export const LogoWatermark: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
  return (
    <img
      src="/assets/logos/MarcaDagua.svg"
      alt="Watermark"
      className={className}
    />
  );
};
