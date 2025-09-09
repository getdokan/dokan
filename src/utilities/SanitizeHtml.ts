// @ts-ignore
import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
    'a',
    'b',
    'em',
    'i',
    'strong',
    'p',
    'br',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'img',
    'video',
    'ul',
    'li',
    'ol',
    'u',
    'blockquote',
    'span',
];
const ALLOWED_ATTR = [
    'target',
    'href',
    'rel',
    'name',
    'download',
    'class',
    'style',
    'src',
    'alt',
];

export const sanitizeHTML = (
    html: string,
    config?: { tags?: typeof ALLOWED_TAGS; attr?: typeof ALLOWED_ATTR }
) => {
    const tagsValue = config?.tags || ALLOWED_TAGS;
    const attrValue = config?.attr || ALLOWED_ATTR;

    return DOMPurify.sanitize( html, {
        ALLOWED_TAGS: tagsValue,
        ALLOWED_ATTR: attrValue,
    } );
};
