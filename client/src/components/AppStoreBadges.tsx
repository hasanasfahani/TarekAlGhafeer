import { useLanguage } from "@/lib/i18n";

const APP_STORE_URL = "https://fitnetinfluencers.onelink.me/sLYI/hasanasfahani";
const PLAY_STORE_URL = "https://fitnetinfluencers.onelink.me/sLYI/hasanasfahani";

interface AppStoreBadgesProps {
  className?: string;
}

export default function AppStoreBadges({ className = "" }: AppStoreBadgesProps) {
  const { t } = useLanguage();

  return (
    <div className={`flex gap-3 items-center ${className}`}>
      <a 
        href={APP_STORE_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105 block"
        data-testid="link-app-store"
      >
        <div className="h-[44px] flex items-center">
          <img 
            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
            alt={t.appStores.appStoreAlt}
            className="h-[44px] w-auto"
          />
        </div>
      </a>
      <a 
        href={PLAY_STORE_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105 block"
        data-testid="link-play-store"
      >
        <div className="h-[44px] flex items-center overflow-hidden">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
            alt={t.appStores.playStoreAlt}
            className="h-[44px] w-auto"
          />
        </div>
      </a>
    </div>
  );
}
