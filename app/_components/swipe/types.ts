export type Profile = {
  id: string;
  name: string;
  age?: number;
  image: string;
  /** When set, card shows image carousel; otherwise uses image as single source. */
  images?: string[];
  isPremium?: boolean;
  subscription?: "vip" | "platinum" | null;
  /** Used for online badge. */
  lastActiveAt?: Date | null;
};
