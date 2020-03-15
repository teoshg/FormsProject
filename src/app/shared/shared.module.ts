import { DropdownService } from './services/dropdown.service';
import { FormDebugComponent } from './form-debug/form-debug.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorMsgComponent } from './error-msg/error-msg.component';
import { CampoControlErroComponent } from './campo-control-erro/campo-control-erro.component';




@NgModule({
  declarations: [
    FormDebugComponent,
    ErrorMsgComponent,
    CampoControlErroComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FormDebugComponent,
    ErrorMsgComponent,
  ],
  providers: [
    DropdownService
  ]
  
})
export class SharedModule { }
