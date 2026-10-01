export interface contributionsInterface {
  repo: string;
  contibutionDescription: string;
  repoOwner: string;
  link: string;
}

export const contributionsUnsorted: contributionsInterface[] = [
  {
    repo: "jlog",
    contibutionDescription:
      "A monitor and payment gateway system built with Laravel",
    repoOwner: "mixtojr",
    link: "https://github.com/mixtojr/jlog",
  },
];

export const featuredContributions: contributionsInterface[] =
  contributionsUnsorted.slice(0, 3);
