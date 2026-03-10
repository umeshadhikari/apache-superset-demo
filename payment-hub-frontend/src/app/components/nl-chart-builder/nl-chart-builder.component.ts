import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NlParserService, NlIntent } from '../../services/nl-parser.service';
import { SupersetDirectService, NlChartResult } from '../../services/superset-direct.service';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  intent?: NlIntent;
  chart?: NlChartResult;
  embedUrl?: SafeResourceUrl;
  loading?: boolean;
  error?: boolean;
}

const SUGGESTIONS = [
  'Show me payments by channel',
  'Total amount by payment type',
  'Payments by status this month',
  'Count of statements by transaction type',
  'Top 10 error codes as a bar chart',
  'Payment trend over time',
  'Average amount by currency as a pie',
  'Statement balance by channel',
];

@Component({
  standalone: false,
  selector: 'app-nl-chart-builder',
  templateUrl: './nl-chart-builder.component.html',
  styleUrls: ['./nl-chart-builder.component.scss'],
})
export class NlChartBuilderComponent {
  query = '';
  messages: ChatMessage[] = [];
  suggestions = SUGGESTIONS;
  processing = false;

  constructor(
    private nlParser: NlParserService,
    private supersetDirect: SupersetDirectService,
    private sanitizer: DomSanitizer
  ) {}

  submitQuery(text?: string): void {
    const q = (text || this.query).trim();
    if (!q || this.processing) return;

    // Add user message
    this.messages.push({ role: 'user', text: q });
    this.query = '';
    this.processing = true;

    // Parse
    const intent = this.nlParser.parse(q);
    const config = this.nlParser.toChartConfig(intent);

    // Add assistant "thinking" message
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      text: `Creating a **${this.vizLabel(intent.vizType)}** for *${intent.chartTitle}*...`,
      intent,
      loading: true,
    };
    this.messages.push(assistantMsg);
    this.scrollToBottom();

    // Create chart
    this.supersetDirect.createChartFromConfig(config).subscribe({
      next: (result) => {
        assistantMsg.loading = false;
        assistantMsg.chart = result;
        assistantMsg.text = `Here's your **${this.vizLabel(intent.vizType)}** — *${result.chartName}*`;
        assistantMsg.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          result.embedUrl
        );
        this.processing = false;
        this.scrollToBottom();
      },
      error: (err) => {
        assistantMsg.loading = false;
        assistantMsg.error = true;
        assistantMsg.text = `Sorry, I couldn't create that chart. ${err?.error?.message || err?.message || 'Superset may be unavailable.'}`;
        this.processing = false;
        this.scrollToBottom();
      },
    });
  }

  useSuggestion(suggestion: string): void {
    this.submitQuery(suggestion);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitQuery();
    }
  }

  vizLabel(vizType: string): string {
    const labels: Record<string, string> = {
      pie: 'Pie Chart',
      echarts_timeseries_bar: 'Bar Chart',
      echarts_timeseries_line: 'Line Chart',
      echarts_area: 'Area Chart',
      big_number_total: 'KPI Card',
      table: 'Data Table',
      treemap_v2: 'Treemap',
      funnel: 'Funnel Chart',
      graph_chart: 'Graph',
    };
    return labels[vizType] || vizType;
  }

  openInSuperset(chart: NlChartResult): void {
    window.open(chart.chartUrl, '_blank');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }
}
