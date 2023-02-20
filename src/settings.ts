import { SectionPosition } from './periodicnotes/sectionposition';

export interface ObsidianClipperSettings {
  tags: string;
  timestampFormat: string;
  dailyNoteHeading: string;
  weeklyNoteHeading: string;
  openFileOnWrite: boolean;
  useDailyNote: boolean;
  dailyPosition: SectionPosition;
  useWeeklyNote: boolean;
  weeklyPosition: SectionPosition;
  dailyEntryTemplateLocation: string;
}

export const DEFAULT_SETTINGS: ObsidianClipperSettings = {
  dailyNoteHeading: '',
  weeklyNoteHeading: '',
  tags: '',
  timestampFormat: 'HH:mm',
  openFileOnWrite: true,
  useDailyNote: true,
  dailyPosition: SectionPosition.APPEND,
  useWeeklyNote: false,
  weeklyPosition: SectionPosition.APPEND,
  dailyEntryTemplateLocation: '',
};
