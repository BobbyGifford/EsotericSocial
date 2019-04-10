import { NgModule } from "@angular/core";
import {
  MatButtonModule,
  MatCardModule,
  MatInputModule,
  MatToolbarModule,
  MatExpansionModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatPaginatorModule,
  MatIconModule,
  MatChipsModule,
  MatDialogModule
} from "@angular/material";

@NgModule({
  exports: [
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
  ]
})
export class AngularMaterialModule {}
