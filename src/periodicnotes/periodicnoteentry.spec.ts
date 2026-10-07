import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as periodic from 'obsidian-daily-notes-interface';
import { FakeApp, notices, settle, tfile } from '../../test/fakes/fakeapp';
import { clipper } from '../../test/fakes/clippers';
import { ClippedData } from '../clippeddata';
import { SectionPosition } from '../settings/types';
import { DailyPeriodicNoteEntry } from './dailyperiodicnoteentry';
import { WeeklyPeriodicNoteEntry } from './weeklyperiodicnoteentry';

vi.mock('obsidian-daily-notes-interface', () => ({
	appHasDailyNotesPluginLoaded: vi.fn(),
	getAllDailyNotes: vi.fn(() => ({})),
	getDailyNote: vi.fn(),
	createDailyNote: vi.fn(),
	appHasWeeklyNotesPluginLoaded: vi.fn(),
	getAllWeeklyNotes: vi.fn(() => ({})),
	getWeeklyNote: vi.fn(),
	createWeeklyNote: vi.fn(),
}));

const mocked = vi.mocked(periodic);

describe.each([
	{
		name: 'daily',
		Entry: DailyPeriodicNoteEntry,
		enabled: mocked.appHasDailyNotesPluginLoaded,
		get: mocked.getDailyNote,
		create: mocked.createDailyNote,
		path: 'daily/2024-01-02.md',
	},
	{
		name: 'weekly',
		Entry: WeeklyPeriodicNoteEntry,
		enabled: mocked.appHasWeeklyNotesPluginLoaded,
		get: mocked.getWeeklyNote,
		create: mocked.createWeeklyNote,
		path: 'weekly/2024-W01.md',
	},
])(
	'$name periodic note entry',
	({ name, Entry, enabled, get, create, path }) => {
		beforeEach(() => {
			vi.clearAllMocks();
			enabled.mockReturnValue(true);
		});

		const write = async (fake: FakeApp) => {
			const data = new ClippedData(
				'Page',
				'https://ex.com',
				clipper(),
				fake.app
			);
			await new Entry(
				fake.app,
				false,
				SectionPosition.APPEND,
				''
			).writeToPeriodicNote(data, 'Clips', 2);
			await settle();
		};

		it('writes under the heading in the existing note', async () => {
			const fake = new FakeApp({ [path]: '## Clips\n- old' });
			get.mockReturnValue(tfile(path));
			await write(fake);
			expect(fake.read(path)).toBe(
				'## Clips\n- old\n- [ ] [Page](https://ex.com) \n\n---'
			);
			expect(create).not.toHaveBeenCalled();
		});

		it('creates the note when it does not exist yet', async () => {
			const fake = new FakeApp();
			get.mockReturnValue(undefined as never);
			create.mockImplementation(async () => {
				fake.addFile(path, '');
				return tfile(path);
			});
			await write(fake);
			expect(create).toHaveBeenCalledOnce();
			expect(fake.read(path)).toBe(
				'\n## Clips \n\n - [ ] [Page](https://ex.com) \n\n---'
			);
		});

		it('rejects when the vault write fails', async () => {
			const fake = new FakeApp({ [path]: '## Clips' });
			get.mockReturnValue(tfile(path));
			const app = fake.app;
			app.vault.modify = () => Promise.reject(new Error('disk full'));
			await expect(
				new Entry(app, false, SectionPosition.APPEND, '').writeToPeriodicNote(
					new ClippedData('Page', 'https://ex.com', clipper(), app),
					'Clips',
					2
				)
			).rejects.toThrow('disk full');
		});

		it('shows a notice when the note cannot be created', async () => {
			get.mockReturnValue(undefined as never);
			create.mockResolvedValue(undefined);
			await write(new FakeApp());
			expect(notices).toEqual([
				`Obsidian Clipper couldn't create the ${name} note to write to`,
			]);
		});

		it(`shows a notice when the ${name} note feature is disabled`, async () => {
			enabled.mockReturnValue(false);
			await write(new FakeApp());
			expect(notices).toEqual([
				`To use a ${name} note with Obsidian Clipper the ${name} note needs to be enabled from the periodic-notes plugin`,
			]);
			expect(get).not.toHaveBeenCalled();
		});
	}
);
