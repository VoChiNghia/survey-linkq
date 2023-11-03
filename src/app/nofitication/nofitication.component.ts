import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-nofitication',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nofitication.component.html',
  styleUrls: ['./nofitication.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NofiticationComponent {
  message: string = ''
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ){
    this.message = data
  }
}
