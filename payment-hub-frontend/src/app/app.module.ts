import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { PaymentFilesComponent } from './components/payment-files/payment-files.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { PaymentDetailComponent } from './components/payment-detail/payment-detail.component';
import { CreatePaymentComponent } from './components/create-payment/create-payment.component';
import { StatementsComponent } from './components/statements/statements.component';
import { DashboardBuilderComponent } from './components/dashboard-builder/dashboard-builder.component';
import { DashboardListComponent } from './components/dashboard-list/dashboard-list.component';
import { SupersetEmbedComponent } from './components/superset-embed/superset-embed.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PaymentFilesComponent,
    PaymentsComponent,
    PaymentDetailComponent,
    CreatePaymentComponent,
    StatementsComponent,
    DashboardBuilderComponent,
    DashboardListComponent,
    SupersetEmbedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
