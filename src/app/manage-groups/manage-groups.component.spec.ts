import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { ManageGroupsComponent } from './manage-groups.component';

describe('ManageGroupsComponent', () => {
  let component: ManageGroupsComponent;
  let fixture: ComponentFixture<ManageGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ManageGroupsComponent, // Import the standalone component
        RouterTestingModule,  // Add RouterTestingModule for routing services
        HttpClientModule      // Add HttpClientModule to handle HTTP requests
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Check if the component is created successfully
    expect(component).toBeTruthy();
  });
});
