"use strict";
exports.__esModule = true;
exports.MarkdownTables = void 0;
var MarkdownTablesHelper = /** @class */ (function () {
    function MarkdownTablesHelper() {
    }
    // Various conditions under which a table should be skipped - i.e. each cell
    // will be rendered one after the other as if they were paragraphs.
    MarkdownTablesHelper.tableShouldBeSkipped = function (tableNode) {
        if (!tableNode)
            return true;
        if (!tableNode.rows)
            return true;
        if (tableNode.rows.length === 1 && tableNode.rows[0].childNodes.length <= 1)
            return true; // Table with only one cell
        if (MarkdownTablesHelper.nodeContainsTable(tableNode))
            return true;
        return false;
    };
    // A tr is a heading row if:
    // - the parent is a THEAD
    // - or if its the first child of the TABLE or the first TBODY (possibly
    //   following a blank THEAD)
    // - and every cell is a TH
    MarkdownTablesHelper.isHeadingRow = function (tr) {
        var parentNode = tr.parentNode;
        var headingRow = false;
        if (parentNode) {
            if (parentNode.nodeName === 'THEAD') {
                headingRow = true;
            }
            else if (parentNode.firstChild !== tr) {
                headingRow = false;
            }
            else if (parentNode.nodeName === 'TABLE' ||
                MarkdownTablesHelper.isFirstTbody(parentNode)) {
                headingRow = Array.prototype.every.call(tr.childNodes, function (n) {
                    return n.nodeName === 'TH';
                });
            }
        }
        return headingRow;
    };
    MarkdownTablesHelper.isFirstTbody = function (element) {
        var previousSibling = element.previousSibling;
        var isFirstTbody = false;
        if (previousSibling) {
            if (element.nodeName !== 'TBODY') {
                // element isn't a tbody
                isFirstTbody = false;
            }
            else {
                if (!previousSibling) {
                    isFirstTbody = true;
                }
                else if (previousSibling.nodeName === 'THEAD' &&
                    previousSibling.textContent &&
                    /^\s*$/i.test(previousSibling.textContent)) {
                    isFirstTbody = true;
                }
                else {
                    isFirstTbody = false;
                }
            }
        }
        return isFirstTbody;
    };
    MarkdownTablesHelper.cell = function (content, node, index) {
        if (node === void 0) { node = null; }
        if (index === void 0) { index = null; }
        if (index === null && node != null) {
            if (node.parentNode) {
                index = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
            }
        }
        var prefix = ' ';
        if (index === 0)
            prefix = '| ';
        var filteredContent = content
            .trim()
            .replace(/\n\r/g, '<br>')
            .replace(/\n/g, '<br>'); // replace new lines with <br> tags
        filteredContent = filteredContent.replace(/\|+/g, '\\|'); // escape any | characters in the content
        while (filteredContent.length < 3)
            filteredContent += ' ';
        if (node)
            filteredContent = MarkdownTablesHelper.handleColSpan(filteredContent, node, ' ');
        return prefix + filteredContent + ' |';
    };
    MarkdownTablesHelper.nodeContainsTable = function (node) {
        if (!node.childNodes)
            return false;
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.nodeName === 'TABLE')
                return true;
            if (MarkdownTablesHelper.nodeContainsTable(child))
                return true;
        }
        return false;
    };
    MarkdownTablesHelper.nodeParentTable = function (node) {
        var parent = node.parentNode;
        if (parent) {
            while (parent && parent.nodeName !== 'TABLE') {
                parent = parent.parentNode;
            }
        }
        return parent;
    };
    MarkdownTablesHelper.handleColSpan = function (content, node, emptyChar) {
        var colspan = node.getAttribute('colspan') || 1;
        for (var i = 1; i < colspan; i++) {
            content += ' | ' + emptyChar.repeat(3);
        }
        return content;
    };
    MarkdownTablesHelper.tableColCount = function (node) {
        var maxColCount = 0;
        if (node && node.rows) {
            for (var i = 0; i < node.rows.length; i++) {
                var row = node.rows[i];
                var colCount = row.childNodes.length;
                if (colCount > maxColCount)
                    maxColCount = colCount;
            }
        }
        return maxColCount;
    };
    return MarkdownTablesHelper;
}());
var MarkdownTables = /** @class */ (function () {
    function MarkdownTables() {
    }
    MarkdownTables.prototype.tables = function (turndownService) {
        turndownService.keep(function (node) {
            var shouldFilter = false;
            if (node.nodeName) {
                shouldFilter = node.nodeName === 'TABLE';
            }
            return shouldFilter;
        });
        var rules = {
            tableCell: {
                filter: ['th', 'td'],
                replacement: function (content, node) {
                    if (MarkdownTablesHelper.tableShouldBeSkipped(MarkdownTablesHelper.nodeParentTable(node)))
                        return content;
                    return MarkdownTablesHelper.cell(content, node);
                }
            },
            tableRow: {
                filter: 'tr',
                replacement: function (content, node) {
                    var parentTable = MarkdownTablesHelper.nodeParentTable(node);
                    if (MarkdownTablesHelper.tableShouldBeSkipped(parentTable))
                        return content;
                    var borderCells = '';
                    var alignMap = {
                        left: ':--',
                        right: '--:',
                        center: ':-:'
                    };
                    if (MarkdownTablesHelper.isHeadingRow(node)) {
                        var colCount = MarkdownTablesHelper.tableColCount(parentTable);
                        for (var i = 0; i < colCount; i++) {
                            var childNode = colCount >= node.childNodes.length ? null : node.childNodes[i];
                            var border = '---';
                            var align = childNode
                                ? (childNode.getAttribute('align') || '').toLowerCase()
                                : '';
                            if (align)
                                border = alignMap[align] || border;
                            if (childNode) {
                                borderCells += MarkdownTablesHelper.cell(border, node.childNodes[i]);
                            }
                            else {
                                borderCells += MarkdownTablesHelper.cell(border, null, i);
                            }
                        }
                    }
                    return '\n' + content + (borderCells ? '\n' + borderCells : '');
                }
            },
            table: {
                // Only convert tables with a heading row.
                // Tables with no heading row are kept using `keep` (see below).
                filter: function (node) {
                    return node.nodeName === 'TABLE';
                },
                replacement: function (content, node) {
                    if (MarkdownTablesHelper.tableShouldBeSkipped(node))
                        return content;
                    // Ensure there are no blank lines
                    content = content.replace(/\n+/g, '\n');
                    // If table has no heading, add an empty one so as to get a valid Markdown table
                    var secondLine = content.trim().split('\n');
                    if (secondLine.length >= 2)
                        secondLine = secondLine[1];
                    var secondLineIsDivider = secondLine.indexOf('| ---') === 0;
                    var columnCount = MarkdownTablesHelper.tableColCount(node);
                    var emptyHeader = '';
                    if (columnCount && !secondLineIsDivider) {
                        emptyHeader =
                            '|' +
                                '     |'.repeat(columnCount) +
                                '\n' +
                                '|' +
                                ' --- |'.repeat(columnCount);
                    }
                    return '\n\n' + emptyHeader + content + '\n\n';
                }
            },
            tableSection: {
                filter: ['thead', 'tbody', 'tfoot'],
                replacement: function (content) {
                    return content;
                }
            }
        };
        var k;
        for (k in rules) {
            turndownService.addRule(k, rules[k]);
        }
    };
    return MarkdownTables;
}());
exports.MarkdownTables = MarkdownTables;
