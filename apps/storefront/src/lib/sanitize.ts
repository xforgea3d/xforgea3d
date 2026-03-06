import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(dirty: string): string {
   return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
         'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
         'p', 'br', 'hr',
         'ul', 'ol', 'li',
         'a', 'strong', 'em', 'b', 'i', 'u', 's', 'del',
         'blockquote', 'pre', 'code',
         'table', 'thead', 'tbody', 'tr', 'th', 'td',
         'img', 'figure', 'figcaption',
         'div', 'span', 'section', 'article',
         'sup', 'sub', 'mark',
      ],
      ALLOWED_ATTR: [
         'href', 'target', 'rel', 'src', 'alt', 'title',
         'class', 'id', 'width', 'height', 'loading',
         'colspan', 'rowspan',
      ],
      ALLOW_DATA_ATTR: false,
   })
}
