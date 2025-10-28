export type Role = 'user' | 'model';

export interface WebSource {
  uri: string;
  title: string;
}

export interface Message {
  role: Role;
  content: string;
  sources?: WebSource[];
}

export interface PortfolioProfile {
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  financialGoals: string[];
  timeline: number;
}
