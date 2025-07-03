import { HttpClientModule } from '@angular/common/http';
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {ClientesModule} from "./views/pages/clientes/clientes.module";
import {AppComponent} from "./app.component";

@NgModule({
  imports: [
    BrowserModule,
    ClientesModule,
    HttpClientModule  // <-- Añade esto aquí
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
