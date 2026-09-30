import { ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss'
})
/**
 * Provides a reusable animated dialog shell for feature components.
 */
export class Dialog {
  @Input() width = '480px';
  @Output() closed = new EventEmitter<void>();

  isOpen = false;
  isClosing = false;

  constructor(private cdr: ChangeDetectorRef) {}
  
  /**
   * Runs the closing animation before hiding the dialog and emitting its close event.
   */
  close(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.isClosing = false;
      this.isOpen = false;
      this.closed.emit();
      this.cdr.markForCheck();
    }, 400);
  }

  open(): void {
    this.isClosing = false;
    this.isOpen = true;
    this.cdr.markForCheck();
  }
}

