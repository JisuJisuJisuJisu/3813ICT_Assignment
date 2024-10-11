import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { HttpClientModule } from '@angular/common/http';
import { ManageChannelsComponent } from './manage-channels.component';

describe('ManageChannelsComponent', () => {
  let component: ManageChannelsComponent;
  let fixture: ComponentFixture<ManageChannelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageChannelsComponent, RouterTestingModule, HttpClientModule]
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
