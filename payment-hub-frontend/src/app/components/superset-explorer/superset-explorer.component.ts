import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-superset-explorer',
  templateUrl: './superset-explorer.component.html',
  styleUrls: ['./superset-explorer.component.scss']
})
export class SupersetExplorerComponent {
  supersetUrl: SafeResourceUrl;
  supersetBaseUrl = environment.superset.baseUrl;
  iframeError = false;

  constructor(private sanitizer: DomSanitizer) {
    const url = `${environment.superset.baseUrl}/superset/welcome/`;
    this.supersetUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onIframeError(): void {
    this.iframeError = true;
  }
}
