import { useTranslation } from 'react-i18next';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '~/components/ui/table';
import { formatBigInt } from '~/lib/utils';
import { PlayerData } from '~/~types/PlayerData';

export interface SkillsTabProps {
  data: {
    player: PlayerData;
    stats: any;
  };
}

export default function SkillTab(props: Readonly<SkillsTabProps>) {
  const { t } = useTranslation();
  const { player, stats } = props.data;

  const skills = player.Skills.Skills.sort((a, b) => a.JagexID - b.JagexID).map((s) => ({
    ...s,
    today: {
      levels: stats.dailyLevels[s.HumanName],
      xp: stats.dailyXP[s.HumanName],
    },
  }));
  const levelsToday = Object.values(stats.dailyLevels).reduce((a, b) => Number(a) + Number(b), 0)
  const xpToday = Object.values(stats.dailyXP).reduce((a, b) => Number(a) + Number(b), 0);
  const skillsLeftTo99 = player.Skills.Skills.filter((skill) => skill.Level < 99);
  const skillsLeftTo120 = player.Skills.Skills.filter((skill) => skill.Level < 120 && skill.Level >= 99);
  const skillsAt120 = player.Skills.Skills.filter((skill) => skill.Level === 120);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{Number(player.Skills.Level)}</div>
              <div className="text-sm text-muted-foreground">
                {t('pages.player_profile.total_level')}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatBigInt(Number(player.Skills.XP))}</div>
              <div className="text-sm text-muted-foreground">
                {t('pages.player_profile.tabs.skills.total_xp')}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{String(levelsToday)}</div>
              <div className="text-sm text-muted-foreground">
                {t('pages.player_profile.tabs.skills.levels_today')}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatBigInt(Number(xpToday))}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('pages.player_profile.tabs.skills.xp_today')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-orange-500">{skillsLeftTo99.length}</div>
              <div className="text-sm text-muted-foreground">Skills Left to 99</div>
            </div>
            {skillsLeftTo99.length > 0 && (
              <div className="space-y-1">
                {skillsLeftTo99.slice(0, 3).map((skill) => (
                  <div key={skill.JagexID} className="flex justify-between items-center text-xs">
                    <span>{skill.HumanName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Number(skill.Level)}
                    </Badge>
                  </div>
                ))}
                {skillsLeftTo99.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{skillsLeftTo99.length - 3} more
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-blue-500">{skillsLeftTo120.length}</div>
              <div className="text-sm text-muted-foreground">Skills Left to 120</div>
            </div>
            {skillsLeftTo120.length > 0 && (
              <div className="space-y-1">
                {skillsLeftTo120.slice(0, 3).map((skill) => (
                  <div key={skill.JagexID} className="flex justify-between items-center text-xs">
                    <span>{skill.HumanName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Number(skill.Level)}
                    </Badge>
                  </div>
                ))}
                {skillsLeftTo120.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{skillsLeftTo120.length - 3} more
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-purple-500">{skillsAt120.length}</div>
              <div className="text-sm text-muted-foreground">Skills at 120</div>
            </div>
            {skillsAt120.length > 0 && (
              <div className="space-y-1">
                {skillsAt120.slice(0, 3).map((skill) => (
                  <div key={skill.JagexID} className="flex justify-between items-center text-xs">
                    <span>{skill.HumanName}</span>
                    <Badge variant="default" className="text-xs bg-purple-500">
                      120
                    </Badge>
                  </div>
                ))}
                {skillsAt120.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{skillsAt120.length - 3} more
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {t('pages.player_profile.tabs.skills.table.title')}
          </CardTitle>
          <CardDescription>
            {' '}
            {t('pages.player_profile.tabs.skills.table.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('pages.player_profile.tabs.skills.table.headers.skill')}</TableHead>
                <TableHead className="text-right">
                  {t('pages.player_profile.tabs.skills.table.headers.level')}
                </TableHead>
                <TableHead className="text-right">
                  {t('pages.player_profile.tabs.skills.table.headers.virtual')}
                </TableHead>
                <TableHead className="text-right">
                  {t('pages.player_profile.tabs.skills.table.headers.experience')}
                </TableHead>
                <TableHead className="text-right">
                  {t('pages.player_profile.tabs.skills.levels_today')}
                </TableHead>
                <TableHead className="text-right">
                  {t('pages.player_profile.tabs.skills.xp_today')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => (
                <TableRow key={`skill-${skill.JagexID}`}>
                  <TableCell className="font-medium">{skill.HumanName}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{skill.Level > 99 ? 99 : Number(skill.Level)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{Number(skill.Level)}</TableCell>
                  <TableCell className="text-right">{formatBigInt(Number(skill.XP))}</TableCell>
                  <TableCell className="text-right">
                    {skill.today.levels > 0 ? (
                      <Badge variant="default" className="bg-green-500">
                        {skill.today.levels}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {skill.today.xp > 0 ? (
                      <span className="text-green-400 font-medium">
                        +{formatBigInt(Number(skill.today.xp))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
