import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';
import { useFetcher } from '@remix-run/react';
import { RefreshCw } from 'lucide-react';
import FavouriteProfileButton from './favourite-button';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader } from '~/components/ui/card';
import { Tooltip } from '~/components/ui/tooltip';
import { PlayerData } from '~/~types/PlayerData';
import { useTranslation } from 'react-i18next';
import { formatDistance } from 'date-fns';
import RefreshProfileButton from './refresh-button';

export interface HeaderComponentProps {
  data: {
    player: PlayerData;
    refreshInfo: {
      refreshable: boolean;
      refreshable_at: Date | null;
    };
    chatheadURI: string;
  };
}

export default function Header(props: Readonly<HeaderComponentProps>) {
  const { player, refreshInfo } = props.data;
  const { t } = useTranslation();

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
              <AvatarImage
                src={`https://secure.runescape.com/m=avatar-rs/${player.Username}/chat.png`}
                alt={`${player.Username}'s avatar`}
              />
              <AvatarFallback className="w-16 h-16 sm:w-20 sm:h-20 bg-primary text-xl sm:text-2xl font-bold text-primary-foreground">
                {player.Username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold truncate">{player.Username}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                <Badge variant="outline" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {t('pages.player_profile.online')}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <RefreshProfileButton refreshInfo={props.data.refreshInfo} username={player.Username}/>
            <FavouriteProfileButton RSN={player.Username} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
