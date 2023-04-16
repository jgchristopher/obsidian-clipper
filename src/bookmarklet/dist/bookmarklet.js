(() => {
	'use strict';
	var e,
		n,
		t,
		r,
		i,
		o,
		a,
		l,
		u,
		c,
		d,
		f = {
			36: (e, n, t) => {
				function r(e, n) {
					return Array(n + 1).join(e);
				}
				t.r(n), t.d(n, { default: () => L });
				var i = [
					'ADDRESS',
					'ARTICLE',
					'ASIDE',
					'AUDIO',
					'BLOCKQUOTE',
					'BODY',
					'CANVAS',
					'CENTER',
					'DD',
					'DIR',
					'DIV',
					'DL',
					'DT',
					'FIELDSET',
					'FIGCAPTION',
					'FIGURE',
					'FOOTER',
					'FORM',
					'FRAMESET',
					'H1',
					'H2',
					'H3',
					'H4',
					'H5',
					'H6',
					'HEADER',
					'HGROUP',
					'HR',
					'HTML',
					'ISINDEX',
					'LI',
					'MAIN',
					'MENU',
					'NAV',
					'NOFRAMES',
					'NOSCRIPT',
					'OL',
					'OUTPUT',
					'P',
					'PRE',
					'SECTION',
					'TABLE',
					'TBODY',
					'TD',
					'TFOOT',
					'TH',
					'THEAD',
					'TR',
					'UL',
				];
				function o(e) {
					return c(e, i);
				}
				var a = [
					'AREA',
					'BASE',
					'BR',
					'COL',
					'COMMAND',
					'EMBED',
					'HR',
					'IMG',
					'INPUT',
					'KEYGEN',
					'LINK',
					'META',
					'PARAM',
					'SOURCE',
					'TRACK',
					'WBR',
				];
				function l(e) {
					return c(e, a);
				}
				var u = [
					'A',
					'TABLE',
					'THEAD',
					'TBODY',
					'TFOOT',
					'TH',
					'TD',
					'IFRAME',
					'SCRIPT',
					'AUDIO',
					'VIDEO',
				];
				function c(e, n) {
					return n.indexOf(e.nodeName) >= 0;
				}
				function d(e, n) {
					return (
						e.getElementsByTagName &&
						n.some(function (n) {
							return e.getElementsByTagName(n).length;
						})
					);
				}
				var f = {};
				function s(e) {
					return e ? e.replace(/(\n+\s*)+/g, '\n') : '';
				}
				function p(e) {
					for (var n in ((this.options = e),
					(this._keep = []),
					(this._remove = []),
					(this.blankRule = { replacement: e.blankReplacement }),
					(this.keepReplacement = e.keepReplacement),
					(this.defaultRule = { replacement: e.defaultReplacement }),
					(this.array = []),
					e.rules))
						this.array.push(e.rules[n]);
				}
				function h(e, n, t) {
					for (var r = 0; r < e.length; r++) {
						var i = e[r];
						if (g(i, n, t)) return i;
					}
				}
				function g(e, n, t) {
					var r = e.filter;
					if ('string' == typeof r) {
						if (r === n.nodeName.toLowerCase()) return !0;
					} else if (Array.isArray(r)) {
						if (r.indexOf(n.nodeName.toLowerCase()) > -1) return !0;
					} else {
						if ('function' != typeof r)
							throw new TypeError(
								'`filter` needs to be a string, array, or function'
							);
						if (r.call(e, n, t)) return !0;
					}
				}
				function m(e) {
					var n = e.nextSibling || e.parentNode;
					return e.parentNode.removeChild(e), n;
				}
				function v(e, n, t) {
					return (e && e.parentNode === n) || t(n)
						? n.nextSibling || n.parentNode
						: n.firstChild || n.nextSibling || n.parentNode;
				}
				(f.paragraph = {
					filter: 'p',
					replacement: function (e) {
						return '\n\n' + e + '\n\n';
					},
				}),
					(f.lineBreak = {
						filter: 'br',
						replacement: function (e, n, t) {
							return t.br + '\n';
						},
					}),
					(f.heading = {
						filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
						replacement: function (e, n, t) {
							var i = Number(n.nodeName.charAt(1));
							return 'setext' === t.headingStyle && i < 3
								? '\n\n' + e + '\n' + r(1 === i ? '=' : '-', e.length) + '\n\n'
								: '\n\n' + r('#', i) + ' ' + e + '\n\n';
						},
					}),
					(f.blockquote = {
						filter: 'blockquote',
						replacement: function (e) {
							return (
								'\n\n' +
								(e = (e = e.replace(/^\n+|\n+$/g, '')).replace(/^/gm, '> ')) +
								'\n\n'
							);
						},
					}),
					(f.list = {
						filter: ['ul', 'ol'],
						replacement: function (e, n) {
							var t = n.parentNode;
							return 'LI' === t.nodeName && t.lastElementChild === n
								? '\n' + e
								: '\n\n' + e + '\n\n';
						},
					}),
					(f.listItem = {
						filter: 'li',
						replacement: function (e, n, t) {
							e = e
								.replace(/^\n+/, '')
								.replace(/\n+$/, '\n')
								.replace(/\n/gm, '\n    ');
							var r = t.bulletListMarker + '   ',
								i = n.parentNode;
							if ('OL' === i.nodeName) {
								var o = i.getAttribute('start'),
									a = Array.prototype.indexOf.call(i.children, n);
								r = (o ? Number(o) + a : a + 1) + '.  ';
							}
							return r + e + (n.nextSibling && !/\n$/.test(e) ? '\n' : '');
						},
					}),
					(f.indentedCodeBlock = {
						filter: function (e, n) {
							return (
								'indented' === n.codeBlockStyle &&
								'PRE' === e.nodeName &&
								e.firstChild &&
								'CODE' === e.firstChild.nodeName
							);
						},
						replacement: function (e, n, t) {
							return (
								'\n\n    ' +
								n.firstChild.textContent.replace(/\n/g, '\n    ') +
								'\n\n'
							);
						},
					}),
					(f.fencedCodeBlock = {
						filter: function (e, n) {
							return (
								'fenced' === n.codeBlockStyle &&
								'PRE' === e.nodeName &&
								e.firstChild &&
								'CODE' === e.firstChild.nodeName
							);
						},
						replacement: function (e, n, t) {
							for (
								var i,
									o = ((n.firstChild.getAttribute('class') || '').match(
										/language-(\S+)/
									) || [null, ''])[1],
									a = n.firstChild.textContent,
									l = t.fence.charAt(0),
									u = 3,
									c = new RegExp('^' + l + '{3,}', 'gm');
								(i = c.exec(a));

							)
								i[0].length >= u && (u = i[0].length + 1);
							var d = r(l, u);
							return (
								'\n\n' + d + o + '\n' + a.replace(/\n$/, '') + '\n' + d + '\n\n'
							);
						},
					}),
					(f.horizontalRule = {
						filter: 'hr',
						replacement: function (e, n, t) {
							return '\n\n' + t.hr + '\n\n';
						},
					}),
					(f.inlineLink = {
						filter: function (e, n) {
							return (
								'inlined' === n.linkStyle &&
								'A' === e.nodeName &&
								e.getAttribute('href')
							);
						},
						replacement: function (e, n) {
							var t = n.getAttribute('href'),
								r = s(n.getAttribute('title'));
							return r && (r = ' "' + r + '"'), '[' + e + '](' + t + r + ')';
						},
					}),
					(f.referenceLink = {
						filter: function (e, n) {
							return (
								'referenced' === n.linkStyle &&
								'A' === e.nodeName &&
								e.getAttribute('href')
							);
						},
						replacement: function (e, n, t) {
							var r,
								i,
								o = n.getAttribute('href'),
								a = s(n.getAttribute('title'));
							switch ((a && (a = ' "' + a + '"'), t.linkReferenceStyle)) {
								case 'collapsed':
									(r = '[' + e + '][]'), (i = '[' + e + ']: ' + o + a);
									break;
								case 'shortcut':
									(r = '[' + e + ']'), (i = '[' + e + ']: ' + o + a);
									break;
								default:
									var l = this.references.length + 1;
									(r = '[' + e + '][' + l + ']'), (i = '[' + l + ']: ' + o + a);
							}
							return this.references.push(i), r;
						},
						references: [],
						append: function (e) {
							var n = '';
							return (
								this.references.length &&
									((n = '\n\n' + this.references.join('\n') + '\n\n'),
									(this.references = [])),
								n
							);
						},
					}),
					(f.emphasis = {
						filter: ['em', 'i'],
						replacement: function (e, n, t) {
							return e.trim() ? t.emDelimiter + e + t.emDelimiter : '';
						},
					}),
					(f.strong = {
						filter: ['strong', 'b'],
						replacement: function (e, n, t) {
							return e.trim() ? t.strongDelimiter + e + t.strongDelimiter : '';
						},
					}),
					(f.code = {
						filter: function (e) {
							var n = e.previousSibling || e.nextSibling,
								t = 'PRE' === e.parentNode.nodeName && !n;
							return 'CODE' === e.nodeName && !t;
						},
						replacement: function (e) {
							if (!e) return '';
							e = e.replace(/\r?\n|\r/g, ' ');
							for (
								var n = /^`|^ .*?[^ ].* $|`$/.test(e) ? ' ' : '',
									t = '`',
									r = e.match(/`+/gm) || [];
								-1 !== r.indexOf(t);

							)
								t += '`';
							return t + n + e + n + t;
						},
					}),
					(f.image = {
						filter: 'img',
						replacement: function (e, n) {
							var t = s(n.getAttribute('alt')),
								r = n.getAttribute('src') || '',
								i = s(n.getAttribute('title'));
							return r
								? '![' + t + '](' + r + (i ? ' "' + i + '"' : '') + ')'
								: '';
						},
					}),
					(p.prototype = {
						add: function (e, n) {
							this.array.unshift(n);
						},
						keep: function (e) {
							this._keep.unshift({
								filter: e,
								replacement: this.keepReplacement,
							});
						},
						remove: function (e) {
							this._remove.unshift({
								filter: e,
								replacement: function () {
									return '';
								},
							});
						},
						forNode: function (e) {
							return e.isBlank
								? this.blankRule
								: (n = h(this.array, e, this.options)) ||
								  (n = h(this._keep, e, this.options)) ||
								  (n = h(this._remove, e, this.options))
								? n
								: this.defaultRule;
							var n;
						},
						forEach: function (e) {
							for (var n = 0; n < this.array.length; n++) e(this.array[n], n);
						},
					});
				var b,
					N,
					y = 'undefined' != typeof window ? window : {},
					T = (function () {
						var e = y.DOMParser,
							n = !1;
						try {
							new e().parseFromString('', 'text/html') && (n = !0);
						} catch (e) {}
						return n;
					})()
						? y.DOMParser
						: ((b = function () {}),
						  (function () {
								var e = !1;
								try {
									document.implementation.createHTMLDocument('').open();
								} catch (n) {
									window.ActiveXObject && (e = !0);
								}
								return e;
						  })()
								? (b.prototype.parseFromString = function (e) {
										var n = new window.ActiveXObject('htmlfile');
										return (
											(n.designMode = 'on'), n.open(), n.write(e), n.close(), n
										);
								  })
								: (b.prototype.parseFromString = function (e) {
										var n = document.implementation.createHTMLDocument('');
										return n.open(), n.write(e), n.close(), n;
								  }),
						  b);
				function A(e, n) {
					var t;
					return (
						(function (e) {
							var n = e.element,
								t = e.isBlock,
								r = e.isVoid,
								i =
									e.isPre ||
									function (e) {
										return 'PRE' === e.nodeName;
									};
							if (n.firstChild && !i(n)) {
								for (
									var o = null, a = !1, l = null, u = v(l, n, i);
									u !== n;

								) {
									if (3 === u.nodeType || 4 === u.nodeType) {
										var c = u.data.replace(/[ \r\n\t]+/g, ' ');
										if (
											((o && !/ $/.test(o.data)) ||
												a ||
												' ' !== c[0] ||
												(c = c.substr(1)),
											!c)
										) {
											u = m(u);
											continue;
										}
										(u.data = c), (o = u);
									} else {
										if (1 !== u.nodeType) {
											u = m(u);
											continue;
										}
										t(u) || 'BR' === u.nodeName
											? (o && (o.data = o.data.replace(/ $/, '')),
											  (o = null),
											  (a = !1))
											: r(u) || i(u)
											? ((o = null), (a = !0))
											: o && (a = !1);
									}
									var d = v(l, u, i);
									(l = u), (u = d);
								}
								o && ((o.data = o.data.replace(/ $/, '')), o.data || m(o));
							}
						})({
							element: (t =
								'string' == typeof e
									? (N = N || new T())
											.parseFromString(
												'<x-turndown id="turndown-root">' + e + '</x-turndown>',
												'text/html'
											)
											.getElementById('turndown-root')
									: e.cloneNode(!0)),
							isBlock: o,
							isVoid: l,
							isPre: n.preformattedCode ? C : null,
						}),
						t
					);
				}
				function C(e) {
					return 'PRE' === e.nodeName || 'CODE' === e.nodeName;
				}
				function R(e, n) {
					return (
						(e.isBlock = o(e)),
						(e.isCode = 'CODE' === e.nodeName || e.parentNode.isCode),
						(e.isBlank = (function (e) {
							return (
								!l(e) &&
								!(function (e) {
									return c(e, u);
								})(e) &&
								/^\s*$/i.test(e.textContent) &&
								!(function (e) {
									return d(e, a);
								})(e) &&
								!(function (e) {
									return d(e, u);
								})(e)
							);
						})(e)),
						(e.flankingWhitespace = (function (e, n) {
							if (e.isBlock || (n.preformattedCode && e.isCode))
								return { leading: '', trailing: '' };
							var t,
								r = {
									leading: (t = e.textContent.match(
										/^(([ \t\r\n]*)(\s*))[\s\S]*?((\s*?)([ \t\r\n]*))$/
									))[1],
									leadingAscii: t[2],
									leadingNonAscii: t[3],
									trailing: t[4],
									trailingNonAscii: t[5],
									trailingAscii: t[6],
								};
							return (
								r.leadingAscii &&
									E('left', e, n) &&
									(r.leading = r.leadingNonAscii),
								r.trailingAscii &&
									E('right', e, n) &&
									(r.trailing = r.trailingNonAscii),
								{ leading: r.leading, trailing: r.trailing }
							);
						})(e, n)),
						e
					);
				}
				function E(e, n, t) {
					var r, i, a;
					return (
						'left' === e
							? ((r = n.previousSibling), (i = / $/))
							: ((r = n.nextSibling), (i = /^ /)),
						r &&
							(3 === r.nodeType
								? (a = i.test(r.nodeValue))
								: t.preformattedCode && 'CODE' === r.nodeName
								? (a = !1)
								: 1 !== r.nodeType || o(r) || (a = i.test(r.textContent))),
						a
					);
				}
				var S = Array.prototype.reduce,
					k = [
						[/\\/g, '\\\\'],
						[/\*/g, '\\*'],
						[/^-/g, '\\-'],
						[/^\+ /g, '\\+ '],
						[/^(=+)/g, '\\$1'],
						[/^(#{1,6}) /g, '\\$1 '],
						[/`/g, '\\`'],
						[/^~~~/g, '\\~~~'],
						[/\[/g, '\\['],
						[/\]/g, '\\]'],
						[/^>/g, '\\>'],
						[/_/g, '\\_'],
						[/^(\d+)\. /g, '$1\\. '],
					];
				function w(e) {
					if (!(this instanceof w)) return new w(e);
					var n = {
						rules: f,
						headingStyle: 'setext',
						hr: '* * *',
						bulletListMarker: '*',
						codeBlockStyle: 'indented',
						fence: '```',
						emDelimiter: '_',
						strongDelimiter: '**',
						linkStyle: 'inlined',
						linkReferenceStyle: 'full',
						br: '  ',
						preformattedCode: !1,
						blankReplacement: function (e, n) {
							return n.isBlock ? '\n\n' : '';
						},
						keepReplacement: function (e, n) {
							return n.isBlock ? '\n\n' + n.outerHTML + '\n\n' : n.outerHTML;
						},
						defaultReplacement: function (e, n) {
							return n.isBlock ? '\n\n' + e + '\n\n' : e;
						},
					};
					(this.options = (function (e) {
						for (var n = 1; n < arguments.length; n++) {
							var t = arguments[n];
							for (var r in t) t.hasOwnProperty(r) && (e[r] = t[r]);
						}
						return e;
					})({}, n, e)),
						(this.rules = new p(this.options));
				}
				function O(e) {
					var n = this;
					return S.call(
						e.childNodes,
						function (e, t) {
							var r = '';
							return (
								3 === (t = new R(t, n.options)).nodeType
									? (r = t.isCode ? t.nodeValue : n.escape(t.nodeValue))
									: 1 === t.nodeType && (r = B.call(n, t)),
								x(e, r)
							);
						},
						''
					);
				}
				function D(e) {
					var n = this;
					return (
						this.rules.forEach(function (t) {
							'function' == typeof t.append && (e = x(e, t.append(n.options)));
						}),
						e.replace(/^[\t\r\n]+/, '').replace(/[\t\r\n\s]+$/, '')
					);
				}
				function B(e) {
					var n = this.rules.forNode(e),
						t = O.call(this, e),
						r = e.flankingWhitespace;
					return (
						(r.leading || r.trailing) && (t = t.trim()),
						r.leading + n.replacement(t, e, this.options) + r.trailing
					);
				}
				function x(e, n) {
					var t = (function (e) {
							for (var n = e.length; n > 0 && '\n' === e[n - 1]; ) n--;
							return e.substring(0, n);
						})(e),
						r = n.replace(/^\n*/, ''),
						i = Math.max(e.length - t.length, n.length - r.length);
					return t + '\n\n'.substring(0, i) + r;
				}
				w.prototype = {
					turndown: function (e) {
						if (
							!(function (e) {
								return (
									null != e &&
									('string' == typeof e ||
										(e.nodeType &&
											(1 === e.nodeType ||
												9 === e.nodeType ||
												11 === e.nodeType)))
								);
							})(e)
						)
							throw new TypeError(
								e + ' is not a string, or an element/document/fragment node.'
							);
						if ('' === e) return '';
						var n = O.call(this, new A(e, this.options));
						return D.call(this, n);
					},
					use: function (e) {
						if (Array.isArray(e))
							for (var n = 0; n < e.length; n++) this.use(e[n]);
						else {
							if ('function' != typeof e)
								throw new TypeError(
									'plugin must be a Function or an Array of Functions'
								);
							e(this);
						}
						return this;
					},
					addRule: function (e, n) {
						return this.rules.add(e, n), this;
					},
					keep: function (e) {
						return this.rules.keep(e), this;
					},
					remove: function (e) {
						return this.rules.remove(e), this;
					},
					escape: function (e) {
						return k.reduce(function (e, n) {
							return e.replace(n[0], n[1]);
						}, e);
					},
				};
				const L = w;
			},
			402: (e, n) => {
				(n.__esModule = !0), (n.MarkdownTables = void 0);
				var t = (function () {
						function e() {}
						return (
							(e.tableShouldBeSkipped = function (n) {
								return (
									!n ||
									!n.rows ||
									(1 === n.rows.length && n.rows[0].childNodes.length <= 1) ||
									!!e.nodeContainsTable(n)
								);
							}),
							(e.isHeadingRow = function (n) {
								var t = n.parentNode,
									r = !1;
								return (
									t &&
										('THEAD' === t.nodeName
											? (r = !0)
											: t.firstChild !== n
											? (r = !1)
											: ('TABLE' === t.nodeName || e.isFirstTbody(t)) &&
											  (r = Array.prototype.every.call(
													n.childNodes,
													function (e) {
														return 'TH' === e.nodeName;
													}
											  ))),
									r
								);
							}),
							(e.isFirstTbody = function (e) {
								var n = e.previousSibling,
									t = !1;
								return (
									n &&
										(t = !(
											'TBODY' !== e.nodeName ||
											(n &&
												('THEAD' !== n.nodeName ||
													!n.textContent ||
													!/^\s*$/i.test(n.textContent)))
										)),
									t
								);
							}),
							(e.cell = function (n, t, r) {
								void 0 === t && (t = null),
									void 0 === r && (r = null),
									null === r &&
										null != t &&
										t.parentNode &&
										(r = Array.prototype.indexOf.call(
											t.parentNode.childNodes,
											t
										));
								var i = ' ';
								0 === r && (i = '| ');
								var o = n
									.trim()
									.replace(/\n\r/g, '<br>')
									.replace(/\n/g, '<br>');
								for (o = o.replace(/\|+/g, '\\|'); o.length < 3; ) o += ' ';
								return t && (o = e.handleColSpan(o, t, ' ')), i + o + ' |';
							}),
							(e.nodeContainsTable = function (n) {
								if (!n.childNodes) return !1;
								for (var t = 0; t < n.childNodes.length; t++) {
									var r = n.childNodes[t];
									if ('TABLE' === r.nodeName) return !0;
									if (e.nodeContainsTable(r)) return !0;
								}
								return !1;
							}),
							(e.nodeParentTable = function (e) {
								var n = e.parentNode;
								if (n) for (; n && 'TABLE' !== n.nodeName; ) n = n.parentNode;
								return n;
							}),
							(e.handleColSpan = function (e, n, t) {
								for (var r = n.getAttribute('colspan') || 1, i = 1; i < r; i++)
									e += ' | ' + t.repeat(3);
								return e;
							}),
							(e.tableColCount = function (e) {
								var n = 0;
								if (e && e.rows)
									for (var t = 0; t < e.rows.length; t++) {
										var r = e.rows[t].childNodes.length;
										r > n && (n = r);
									}
								return n;
							}),
							e
						);
					})(),
					r = (function () {
						function e() {}
						return (
							(e.prototype.tables = function (e) {
								e.keep(function (e) {
									var n = !1;
									return e.nodeName && (n = 'TABLE' === e.nodeName), n;
								});
								var n,
									r = {
										tableCell: {
											filter: ['th', 'td'],
											replacement: function (e, n) {
												return t.tableShouldBeSkipped(t.nodeParentTable(n))
													? e
													: t.cell(e, n);
											},
										},
										tableRow: {
											filter: 'tr',
											replacement: function (e, n) {
												var r = t.nodeParentTable(n);
												if (t.tableShouldBeSkipped(r)) return e;
												var i = '',
													o = { left: ':--', right: '--:', center: ':-:' };
												if (t.isHeadingRow(n))
													for (var a = t.tableColCount(r), l = 0; l < a; l++) {
														var u =
																a >= n.childNodes.length
																	? null
																	: n.childNodes[l],
															c = '---',
															d = u
																? (u.getAttribute('align') || '').toLowerCase()
																: '';
														d && (c = o[d] || c),
															(i += u
																? t.cell(c, n.childNodes[l])
																: t.cell(c, null, l));
													}
												return '\n' + e + (i ? '\n' + i : '');
											},
										},
										table: {
											filter: function (e) {
												return 'TABLE' === e.nodeName;
											},
											replacement: function (e, n) {
												if (t.tableShouldBeSkipped(n)) return e;
												var r = (e = e.replace(/\n+/g, '\n'))
													.trim()
													.split('\n');
												r.length >= 2 && (r = r[1]);
												var i = 0 === r.indexOf('| ---'),
													o = t.tableColCount(n),
													a = '';
												return (
													o &&
														!i &&
														(a =
															'|' +
															'     |'.repeat(o) +
															'\n|' +
															' --- |'.repeat(o)),
													'\n\n' + a + e + '\n\n'
												);
											},
										},
										tableSection: {
											filter: ['thead', 'tbody', 'tfoot'],
											replacement: function (e) {
												return e;
											},
										},
									};
								for (n in r) e.addRule(n, r[n]);
							}),
							e
						);
					})();
				n.MarkdownTables = r;
			},
		},
		s = {};
	function p(e) {
		var n = s[e];
		if (void 0 !== n) return n.exports;
		var t = (s[e] = { exports: {} });
		return f[e](t, t.exports, p), t.exports;
	}
	(p.d = (e, n) => {
		for (var t in n)
			p.o(n, t) &&
				!p.o(e, t) &&
				Object.defineProperty(e, t, { enumerable: !0, get: n[t] });
	}),
		(p.o = (e, n) => Object.prototype.hasOwnProperty.call(e, n)),
		(p.r = (e) => {
			'undefined' != typeof Symbol &&
				Symbol.toStringTag &&
				Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
				Object.defineProperty(e, '__esModule', { value: !0 });
		}),
		(c = p(36)),
		(d = p(402)),
		(e = {
			h1: '~H1Setting~',
			h2: '##',
			h3: '###',
			h4: '####',
			h5: '#####',
			h6: '######',
		}),
		(o = encodeURIComponent('~VaultNameFiller~')),
		(a = encodeURIComponent('~NotePath~')),
		(l = new c.default({
			headingStyle: 'atx',
			hr: '---',
			bulletListMarker: '-',
			codeBlockStyle: 'fenced',
			emDelimiter: '*',
		})),
		(u = new d.MarkdownTables()),
		l.use(u.tables),
		l.addRule('heading_1_update', {
			filter: ['h1'],
			replacement: function (n) {
				return ''.concat(e.h1, ' ').concat(n);
			},
		}),
		l.addRule('heading_2_update', {
			filter: ['h2'],
			replacement: function (n) {
				return ''.concat(e.h2, ' ').concat(n);
			},
		}),
		l.addRule('heading_3_update', {
			filter: ['h3'],
			replacement: function (n) {
				return ''.concat(e.h3, ' ').concat(n);
			},
		}),
		l.addRule('heading_4_update', {
			filter: ['h4'],
			replacement: function (n) {
				return ''.concat(e.h4, ' ').concat(n);
			},
		}),
		l.addRule('heading_5_update', {
			filter: ['h5'],
			replacement: function (n) {
				return ''.concat(e.h5, ' ').concat(n);
			},
		}),
		l.addRule('heading_6_update', {
			filter: ['h6'],
			replacement: function (n) {
				return ''.concat(e.h6, ' ').concat(n);
			},
		}),
		(n = document.URL),
		(t = document.title),
		(r = l.turndown(
			(function () {
				var e = '';
				if (void 0 !== window.getSelection) {
					var n = window.getSelection();
					if (n && n.rangeCount) {
						for (
							var t = document.createElement('div'), r = 0, i = n.rangeCount;
							r < i;
							++r
						)
							t.appendChild(n.getRangeAt(r).cloneContents());
						e = t.innerHTML;
					}
				}
				return e;
			})()
		)),
		(i = 'obsidian://obsidian-clipper?vault='
			.concat(o, '&notePath=')
			.concat(a, '&url=')
			.concat(encodeURIComponent(n), '&title=')
			.concat(encodeURIComponent(t), '&highlightdata=')
			.concat(encodeURIComponent(r))),
		console.log(i.length),
		(document.location.href = i);
})();
