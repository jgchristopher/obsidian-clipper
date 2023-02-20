import TurndownService from 'turndown';
import { MarkdownTables } from './tables';

export class MarkdownProcessor {
  data?: string;
  constructor(data?: string) {
    this.data = data;
  }

  public process(): string | undefined {
    let markdownData = this.data;
    if (this.data) {
      const markdownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        emDelimiter: '*',
      });
      const tables = new MarkdownTables();
      markdownService.use(tables.tables);
      markdownService.addRule('heading_1_to_2', {
        filter: ['h1'],
        replacement: function(content: string) {
          console.log('Moving H1 to H2 Markdown');
          return `## ${content}`;
        },
      });
      markdownData = markdownService.turndown(this.data);
    }

    return markdownData;
  }
}
