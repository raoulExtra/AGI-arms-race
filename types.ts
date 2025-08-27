
export interface Resources {
  compute: number;
  talent: number;
  funding: number;
  publicTrust: number;
  aiProgress: number;
}

export interface Choice {
  id: string;
  text: string;
}

export interface GameState {
  storyText: string;
  resources: Resources;
  choices: Choice[];
  isGameOver: boolean;
  outcomeText: string;
  feedback: string;
}

export interface GameHistory {
    story: string;
    choice: string;
}