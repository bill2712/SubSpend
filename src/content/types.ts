import type { ReactNode } from 'react';
import type { GuideSlug } from './guides/meta';

export interface GuideSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface Source {
  label: string;
  publisher: string;
  url: string;
}

export interface GuideContent {
  intro: ReactNode;
  sections: GuideSection[];
  sources: Source[];
  related: GuideSlug[];
}

export interface TextPageContent {
  title: string;
  /** ISO date shown as "Updated …" (legal pages). */
  updated?: string;
  lead?: string;
  body: ReactNode;
}

export interface HomeContent {
  title: string;
  body: ReactNode;
}
