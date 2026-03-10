import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  currentRoute = '';
  private routerSubscription: Subscription;

  navItems = [
    { label: 'Overview', icon: '🏠', path: '/', exact: true },
  ];

  navSections = [
    {
      title: 'Payments',
      items: [
        { label: 'Payment Files', icon: '📁', path: '/payment-files' },
        { label: 'Payments', icon: '💳', path: '/payments' },
        { label: 'New Payment', icon: '➕', path: '/payments/create' },
        { label: 'Statements', icon: '📊', path: '/statements' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { label: 'Dashboard Builder', icon: '🛠️', path: '/dashboard-builder' },
        { label: 'My Dashboards', icon: '📈', path: '/dashboards' },
        { label: 'Superset Analytics', icon: '🔍', path: '/analytics/superset' },
        { label: 'Ask a Question', icon: '💬', path: '/analytics/ask' },
      ]
    }
  ];

  constructor(private router: Router) {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.currentRoute = (event as NavigationEnd).urlAfterRedirects;
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  isActive(path: string): boolean {
    if (path === '/') return this.currentRoute === '/';
    return this.currentRoute.startsWith(path);
  }

  getPageTitle(): string {
    const allItems = [
      { path: '/', label: 'Overview' },
      { path: '/payment-files', label: 'Payment Files' },
      { path: '/payments/create', label: 'Create Payment' },
      { path: '/payments', label: 'Payments' },
      { path: '/statements', label: 'Statements' },
      { path: '/dashboard-builder', label: 'Dashboard Builder' },
      { path: '/dashboards', label: 'My Dashboards' },
      { path: '/superset-embed', label: 'Embedded Dashboard' },
      { path: '/analytics/superset', label: 'Superset Analytics' },
      { path: '/analytics/ask', label: 'Ask a Question' },
    ];
    // Check more specific routes first
    const sorted = allItems.sort((a, b) => b.path.length - a.path.length);
    const match = sorted.find(item => this.currentRoute.startsWith(item.path));
    return match ? match.label : 'Payment Hub';
  }
}
