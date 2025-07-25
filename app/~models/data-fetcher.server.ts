import { SkillName } from '@prisma/client';
import config from '~/~services/config.server';
import { prisma } from '~/~services/prisma.server';
import redis from '~/~services/redis.server';
import { RuneMetrics, Runescape } from '~/~services/runescape.server';
import { PlayerData } from '~/~types/PlayerData';

export class PlayerDataFetcher {
  // #region Variables
  /**
   * Redis key for caching player data JSON string
   * @private
   * @readonly
   */
  private get CACHE_KEY() {
    return `player:${this.username}:data`;
  }

  /**
   * Redis key for storing the last fetch timestamp (in ms)
   * @private
   * @readonly
   */
  private get LAST_FETCH_KEY() {
    return `player:${this.username}:last_fetch`;
  }

  /**
   * Redis key for storing the last manual refresh timestamp (in ms)
   * @private
   * @readonly
   */
  private get LAST_MANUAL_REFRESH_KEY() {
    return `player:${this.username}:last_manual_refresh`;
  }

  /**
   * Cache time-to-live for automatic refreshes (ms)
   * @private
   * @readonly
   */
  private readonly CACHE_TTL = config.TIMINGS.AUTO_REFRESH;

  /**
   * Cache time-to-live / cooldown for manual refreshes (ms)
   * @private
   * @readonly
   */
  private readonly CACHE_MANUAL_TTL = config.TIMINGS.MANUAL_REFRESH;

  // #endregion

  // #region Instance Management
  /**
   * Creates an instance of PlayerDataFetcher for a given username.
   * Initializes internal keys based on the username.
   *
   * @param {string} username - RuneScape username (RSN)
   */
  constructor(private username: string) {}

  /**
   * Static factory method to create a PlayerDataFetcher instance
   * only if the player exists in the Runescape system.
   *
   * @param {string} username - RuneScape username (RSN) to check existence for
   * @returns {Promise<PlayerDataFetcher | undefined>} A new PlayerDataFetcher instance if the user exists; otherwise undefined.
   */
  public static async instance(username: string): Promise<PlayerDataFetcher | undefined> {
    const dbUser = await prisma.player.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (dbUser) {
      return new PlayerDataFetcher(username);
    }

    // If not in DB, check existence in RuneScape
    const exists = await Runescape.checkExistence([username]);
    if (!exists?.get(username.toLowerCase())) return;

    // Create user in DB
    await prisma.player.create({
      data: {
        username: username.toLowerCase(),
        lastFetchedAt: new Date(),
      },
    });

    return new PlayerDataFetcher(username);
  }
  // #endregion

  // #region Redis helpers
  /**
   * Fetches a timestamp (in milliseconds) stored under the specified Redis key.
   *
   * @private
   * @param {string} key - Redis key to get the timestamp from
   * @returns {Promise<number>} The timestamp in ms, or 0 if the key does not exist or parsing fails
   */
  private async getTimestamp(key: string): Promise<number> {
    const raw = await redis.get(key);
    return raw ? parseInt(raw, 10) : 0;
  }

  /**
   * Stores a timestamp (in milliseconds) under the specified Redis key.
   *
   * @private
   * @param {string} key - Redis key to set the timestamp
   * @param {number} value - Timestamp in milliseconds to store
   * @returns {Promise<void>}
   */
  private async setTimestamp(key: string, value: number): Promise<void> {
    await redis.set(key, value.toString());
  }

  /**
   * Retrieves cached PlayerData from Redis for the current user.
   *
   * @private
   * @returns {Promise<PlayerData | null>} Parsed PlayerData if present, otherwise null
   */
  private async getCachedData(): Promise<PlayerData | null> {
    const raw = await redis.get(this.CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Stores PlayerData in Redis cache for the current user.
   *
   * @private
   * @param {PlayerData} data - Player data to cache
   * @returns {Promise<void>}
   */
  private async setCachedData(data: PlayerData): Promise<void> {
    await redis.set(this.CACHE_KEY, JSON.stringify(data));
  }
  // #endregion

  // #region Data fetchers
  /**
   * Fetches the freshest player data, either using cached data or forcing a refresh.
   * Should implement the logic for manual refresh cooldown and cache TTL.
   *
   * @param {boolean} [manual=false] - Whether this fetch is a manual refresh request
   * @returns {Promise<PlayerData>} Fresh or cached player data
   */
  public async getFreshestData(manual: boolean = false): Promise<PlayerData | null> {
    const now = Date.now();

    const lastFetch = await this.getTimestamp(this.LAST_FETCH_KEY);
    const lastManualRefresh = await this.getTimestamp(this.LAST_MANUAL_REFRESH_KEY);

    const cacheIsFresh = now - lastFetch < this.CACHE_TTL;
    const manualCooldownPassed = now - lastManualRefresh >= this.CACHE_MANUAL_TTL;

    if (manual && manualCooldownPassed) {
      // manual cooldown passed and the request was a manual refresh
      const freshData = await this.fetchFreshData();
      await this.setCachedData(freshData);
      await this.setTimestamp(this.LAST_FETCH_KEY, now);
      await this.setTimestamp(this.LAST_MANUAL_REFRESH_KEY, now);
      return freshData;
    }

    if (cacheIsFresh) {
      // cache data is perfectly fine
      const cachedData = await this.getCachedData();
      if (cachedData) return cachedData;
    }

    const freshData = await this.fetchFreshData();
    await this.setCachedData(freshData);
    await this.setTimestamp(this.LAST_FETCH_KEY, now);
    return freshData;
  }

  /**
   * Fetch fresh data from the Runescape service.
   * This method calls the external API or database to get live player data.
   *
   * @private
   * @returns {Promise<PlayerData>} Fresh player data.
   */
  private async fetchFreshData(): Promise<PlayerData> {
    const data = await RuneMetrics.getFullProfile(this.username);
    if (typeof data === 'string') throw new Error(data);
    this.saveSnapshotToDatabase(data);
    return data;
  }
  // #endregion

  // #region Boring UI/UX shit basically
  /**
   * Retrieves the timestamp (ms since epoch) of the last data fetch for this player.
   * Returns 0 if no fetch timestamp is recorded.
   *
   * @returns {Promise<number>} Timestamp in milliseconds of last fetch, or 0 if not set.
   */
  public async getLastRefresh(): Promise<number> {
    return await this.getTimestamp(this.LAST_FETCH_KEY);
  }
  // #endregion

  // #region Database
  private async saveSnapshotToDatabase(data: PlayerData): Promise<void> {
    const { Username, LoggedIn, Activities, Skills, Quests } = data;

    const player = await prisma.player.upsert({
      where: { username: Username.toLowerCase() },
      update: { lastFetchedAt: new Date() },
      create: {
        username: Username.toLowerCase(),
        lastFetchedAt: new Date(),
      },
    });

    await prisma.playerSnapshot.create({
      data: {
        playerId: player.id,
        timestamp: new Date(),

        rank: parseInt(Skills.Rank, 10),
        totalXp: BigInt(Skills.XP),
        totalSkill: BigInt(Skills.Level),
        combatLevel: BigInt(Skills.CombatLevel),
        loggedIn: LoggedIn,

        quests_completed: Quests.Completed,
        quests_in_progress: Quests.InProgress,
        quests_not_started: Quests.NotStarted,

        skills: {
          create: Skills.Skills.map((skill) => ({
            name: skill.HumanName as SkillName,
            xp: BigInt(skill.XP),
            rank: BigInt(skill.Rank),
            level: BigInt(skill.Level),
          })),
        },

        quests: {
          create: Quests.Quests.map((quest) => ({
            title: quest.Title,
            status: quest.Status,
            difficulty: quest.Difficulty,
            members: quest.Members,
            questPoints: quest.QuestPoints,
            userEligible: quest.Eligible,
          })),
        },

        // activities: {
        //   create: (Activities ?? []).map((activity) => ({
        //     date: new Date(activity.Date),
        //     details: activity.Details,
        //     text: activity.Text,
        //     token: activity.Token,
        //     type: activity.Type,
        //   })),
        // },
      },
    });
  }
  // #endregion
}
