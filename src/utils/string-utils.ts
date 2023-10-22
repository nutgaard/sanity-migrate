export function replaceIndent(str: string, newIndent: string = ''): string {
    const lines = str.split('\n');
    const lineIndentWidth: number[] = lines
        .filter((it) => it.replaceAll(/\s/g, '').length > 0)
        .map((it) => indentWidth(it));

    const minCommonIndent = indentWidth.length === 0 ? 0 : Math.min(...lineIndentWidth);

    return reindent(
        lines,
        (line) => newIndent + line,
        (line) => line.slice(minCommonIndent),
    );
}

export function trimIndent(str: string): string {
    return replaceIndent(str, '');
}

export function indentWidth(str: string): number {
    const chars = str.split('');
    let firstNonWhiteSpace = -1;
    for (let i = 0; i < chars.length; i++) {
        if (!/\s/.test(chars[i])) {
            firstNonWhiteSpace = i;
            break;
        }
    }

    if (firstNonWhiteSpace === -1) {
        return str.length;
    } else {
        return firstNonWhiteSpace;
    }
}

function reindent(strs: string[], indentAddFn: (str: string) => string, indentCutFn: (str: string) => string): string {
    const out = [];
    for (let i = 0; i < strs.length; i++) {
        const str = strs[i];
        const isBlank = /^\s*$/.test(str);
        if ((i === 0 || i === strs.length - 1) && isBlank) {
            out.push(undefined);
        } else {
            out.push(indentAddFn(indentCutFn(str)));
        }
    }
    return out.join('\n');
}
