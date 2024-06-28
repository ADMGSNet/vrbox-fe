
import DOMPurify from 'dompurify';

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safe',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor(private sanitizer: DomSanitizer) { }

  //************************************************************************//
  // functions
  //************************************************************************//
  /**
   * Transforms the given HTML string into a sanitized and trusted HTML string.
   *
   * @param html - The HTML string to be transformed.
   */
  transform(html: string) {
    const sanitizedHtml = DOMPurify.sanitize(html);
    return this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml);
  }
}
