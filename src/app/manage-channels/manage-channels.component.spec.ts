import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageChannelsComponent } from './manage-channels.component';

describe('ManageChannelsComponent', () => {
  let component: ManageChannelsComponent;
  let fixture: ComponentFixture<ManageChannelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageChannelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
