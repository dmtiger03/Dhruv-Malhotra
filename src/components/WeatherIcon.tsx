import React from "react";
import {
  Sun,
  Moon,
  SunMedium,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning,
  CloudHail,
  Wind,
  Droplets,
  HelpCircle,
} from "lucide-react";

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = "w-6 h-6", size }) => {
  const iconProps = { className, size };

  switch (name) {
    case "Sun":
      return <Sun {...iconProps} />;
    case "Moon":
      return <Moon {...iconProps} />;
    case "SunMedium":
      return <SunMedium {...iconProps} />;
    case "CloudSun":
      return <CloudSun {...iconProps} />;
    case "CloudMoon":
      return <CloudMoon {...iconProps} />;
    case "Cloud":
      return <Cloud {...iconProps} />;
    case "CloudFog":
      return <CloudFog {...iconProps} />;
    case "CloudDrizzle":
      return <CloudDrizzle {...iconProps} />;
    case "CloudRain":
      return <CloudRain {...iconProps} />;
    case "CloudSnow":
      return <CloudSnow {...iconProps} />;
    case "Snowflake":
      return <Snowflake {...iconProps} />;
    case "CloudLightning":
      return <CloudLightning {...iconProps} />;
    case "CloudHail":
      return <CloudHail {...iconProps} />;
    case "Wind":
      return <Wind {...iconProps} />;
    case "Droplets":
      return <Droplets {...iconProps} />;
    default:
      return <HelpCircle {...iconProps} />;
  }
};
