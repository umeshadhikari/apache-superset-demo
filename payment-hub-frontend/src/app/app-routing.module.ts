import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PaymentFilesComponent } from './components/payment-files/payment-files.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { PaymentDetailComponent } from './components/payment-detail/payment-detail.component';
import { CreatePaymentComponent } from './components/create-payment/create-payment.component';
import { StatementsComponent } from './components/statements/statements.component';
import { DashboardBuilderComponent } from './components/dashboard-builder/dashboard-builder.component';
import { DashboardListComponent } from './components/dashboard-list/dashboard-list.component';
import { SupersetEmbedComponent } from './components/superset-embed/superset-embed.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'payment-files', component: PaymentFilesComponent },
  { path: 'payments/create', component: CreatePaymentComponent },
  { path: 'payments/:reference', component: PaymentDetailComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: 'statements', component: StatementsComponent },
  { path: 'dashboard-builder', component: DashboardBuilderComponent },
  { path: 'dashboards', component: DashboardListComponent },
  { path: 'superset-embed/:dashboardId', component: SupersetEmbedComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
