import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-superset-explorer',
  templateUrl: './superset-explorer.component.html',
  styleUrls: ['./superset-explorer.component.scss']
})
export class SupersetExplorerComponent {
  @ViewChild('supersetFrame') supersetFrame!: ElementRef<HTMLIFrameElement>;

  supersetUrl: SafeResourceUrl;
  supersetBaseUrl = environment.superset.baseUrl;
  iframeError = false;

  private blankLinkHandler: ((e: MouseEvent) => void) | null = null;

  constructor(private sanitizer: DomSanitizer) {
    const url = `${environment.superset.baseUrl}/superset/welcome/`;
    this.supersetUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onIframeError(): void {
    this.iframeError = true;
  }

  onIframeLoad(): void {
    const iframeWindow = this.supersetFrame?.nativeElement?.contentWindow;
    if (!iframeWindow) return;

    // Override window.open to navigate inside iframe instead of opening a new tab
    iframeWindow.open = (url?: string | URL, _target?: string, _features?: string): Window | null => {
      if (url) iframeWindow.location.href = url.toString();
      return iframeWindow;
    };

    // Remove any previously registered handler before adding a new one to avoid duplicates
    if (this.blankLinkHandler) {
      iframeWindow.document.removeEventListener('click', this.blankLinkHandler, true);
    }

    // Intercept all target="_blank" anchor clicks to stay in iframe
    this.blankLinkHandler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (anchor && anchor.target === '_blank' && anchor.href) {
        const href = anchor.href;
        if (/^https?:\/\//i.test(href)) {
          e.preventDefault();
          iframeWindow.location.href = href;
        }
      }
    };
    iframeWindow.document.addEventListener('click', this.blankLinkHandler, true);
  }
}
