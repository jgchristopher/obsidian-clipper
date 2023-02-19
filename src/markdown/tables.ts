class MarkdownTablesHelper {
  // Various conditions under which a table should be skipped - i.e. each cell
  // will be rendered one after the other as if they were paragraphs.
  static tableShouldBeSkipped(tableNode: any) {
    if (!tableNode) return true;
    if (!tableNode.rows) return true;
    if (
      tableNode.rows.length === 1 &&
      tableNode.rows[0].childNodes.length <= 1
    )
      return true; // Table with only one cell
    if (MarkdownTablesHelper.nodeContainsTable(tableNode)) return true;
    return false;
  }

  // A tr is a heading row if:
  // - the parent is a THEAD
  // - or if its the first child of the TABLE or the first TBODY (possibly
  //   following a blank THEAD)
  // - and every cell is a TH
  static isHeadingRow(tr: HTMLElement): boolean {
    const parentNode = tr.parentNode;
    let headingRow = false;
    if (parentNode) {
      if (parentNode.nodeName === "THEAD") {
        headingRow = true;
      } else if (parentNode.firstChild !== tr) {
        headingRow = false;
      } else if (
        parentNode.nodeName === "TABLE" ||
        MarkdownTablesHelper.isFirstTbody(parentNode)
      ) {
        headingRow = Array.prototype.every.call(
          tr.childNodes,
          (n: ChildNode) => {
            return n.nodeName === "TH";
          }
        );
      }
    }
    return headingRow;
  }

  static isFirstTbody(element: HTMLElement | ParentNode): boolean {
    const previousSibling = element.previousSibling;
    let isFirstTbody = false;
    if (previousSibling) {
      if (element.nodeName !== "TBODY") {
        // element isn't a tbody
        isFirstTbody = false;
      } else {
        if (!previousSibling) {
          isFirstTbody = true;
        } else if (
          previousSibling.nodeName === "THEAD" &&
          previousSibling.textContent &&
          /^\s*$/i.test(previousSibling.textContent)
        ) {
          isFirstTbody = true;
        } else {
          isFirstTbody = false;
        }
      }
    }
    return isFirstTbody;
  }

  static cell(
    content: string,
    node: HTMLElement | null = null,
    index: number | null = null
  ) {
    if (index === null && node != null) {
      if (node.parentNode) {
        index = Array.prototype.indexOf.call(
          node.parentNode.childNodes,
          node
        );
      }
    }
    let prefix = " ";
    if (index === 0) prefix = "| ";
    let filteredContent = content
      .trim()
      .replace(/\n\r/g, "<br>")
      .replace(/\n/g, "<br>"); // replace new lines with <br> tags
    filteredContent = filteredContent.replace(/\|+/g, "\\|"); // escape any | characters in the content
    while (filteredContent.length < 3) filteredContent += " ";
    if (node)
      filteredContent = MarkdownTablesHelper.handleColSpan(
        filteredContent,
        node,
        " "
      );
    return prefix + filteredContent + " |";
  }

  static nodeContainsTable(node: HTMLElement | ChildNode) {
    if (!node.childNodes) return false;

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeName === "TABLE") return true;
      if (MarkdownTablesHelper.nodeContainsTable(child)) return true;
    }
    return false;
  }

  static nodeParentTable(node: any): any {
    let parent = node.parentNode;
    if (parent) {
      while (parent && parent.nodeName !== "TABLE") {
        parent = parent.parentNode;
      }
    }
    return parent;
  }

  static handleColSpan(
    content: string,
    node: HTMLElement,
    emptyChar: string
  ) {
    const colspan = node.getAttribute("colspan") || 1;
    for (let i = 1; i < colspan; i++) {
      content += " | " + emptyChar.repeat(3);
    }
    return content;
  }

  static tableColCount(node: HTMLTableElement) {
    let maxColCount = 0;
    if (node && node.rows) {
      for (let i = 0; i < node.rows.length; i++) {
        const row = node.rows[i];
        const colCount = row.childNodes.length;
        if (colCount > maxColCount) maxColCount = colCount;
      }
    }

    return maxColCount;
  }
}

export class MarkdownTables {
  public tables(turndownService: any) {
    turndownService.keep(function(node: any) {
      let shouldFilter = false;
      if (node.nodeName) {
        shouldFilter = node.nodeName === "TABLE";
      }
      return shouldFilter;
    });
    const rules = {
      tableCell: {
        filter: ["th", "td"],
        replacement: function(
          content: string,
          node: HTMLTableElement
        ) {
          if (
            MarkdownTablesHelper.tableShouldBeSkipped(
              MarkdownTablesHelper.nodeParentTable(node)
            )
          )
            return content;
          return MarkdownTablesHelper.cell(content, node);
        },
      },
      tableRow: {
        filter: "tr",
        replacement: function(content: any, node: any) {
          const parentTable =
            MarkdownTablesHelper.nodeParentTable(node);
          if (MarkdownTablesHelper.tableShouldBeSkipped(parentTable))
            return content;

          let borderCells = "";
          const alignMap: any = {
            left: ":--",
            right: "--:",
            center: ":-:",
          };

          if (MarkdownTablesHelper.isHeadingRow(node)) {
            const colCount =
              MarkdownTablesHelper.tableColCount(parentTable);
            for (let i = 0; i < colCount; i++) {
              const childNode =
                colCount >= node.childNodes.length
                  ? null
                  : node.childNodes[i];
              let border: any = "---";
              const align = childNode
                ? (
                  childNode.getAttribute("align") || ""
                ).toLowerCase()
                : "";

              if (align) border = alignMap[align] || border;
              if (childNode) {
                borderCells += MarkdownTablesHelper.cell(
                  border,
                  node.childNodes[i]
                );
              } else {
                borderCells += MarkdownTablesHelper.cell(
                  border,
                  null,
                  i
                );
              }
            }
          }
          return (
            "\n" + content + (borderCells ? "\n" + borderCells : "")
          );
        },
      },
      table: {
        // Only convert tables with a heading row.
        // Tables with no heading row are kept using `keep` (see below).
        filter: function(node: any) {
          return node.nodeName === "TABLE";
        },

        replacement: function(content: any, node: any) {
          if (MarkdownTablesHelper.tableShouldBeSkipped(node))
            return content;

          // Ensure there are no blank lines
          content = content.replace(/\n+/g, "\n");

          // If table has no heading, add an empty one so as to get a valid Markdown table
          let secondLine = content.trim().split("\n");
          if (secondLine.length >= 2) secondLine = secondLine[1];
          const secondLineIsDivider = secondLine.indexOf("| ---") === 0;

          const columnCount = MarkdownTablesHelper.tableColCount(node);
          let emptyHeader = "";
          if (columnCount && !secondLineIsDivider) {
            emptyHeader =
              "|" +
              "     |".repeat(columnCount) +
              "\n" +
              "|" +
              " --- |".repeat(columnCount);
          }

          return "\n\n" + emptyHeader + content + "\n\n";
        },
      },
      tableSection: {
        filter: ["thead", "tbody", "tfoot"],
        replacement: function(content: any) {
          return content;
        },
      },
    };

    let k: keyof typeof rules;
    for (k in rules) {
      turndownService.addRule(k, rules[k]);
    }
  }
}
