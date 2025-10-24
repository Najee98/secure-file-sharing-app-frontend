import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicPreviewComponent } from './public-preview.component';

describe('PublicPreviewComponent', () => {
  let component: PublicPreviewComponent;
  let fixture: ComponentFixture<PublicPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
