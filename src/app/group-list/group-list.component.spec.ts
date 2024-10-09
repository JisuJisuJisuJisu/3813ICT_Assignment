import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { GroupListComponent } from './group-list.component';

describe('GroupListComponent', () => {
  let component: GroupListComponent;
  let fixture: ComponentFixture<GroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GroupListComponent,  // Import the standalone component
        RouterTestingModule, // Add RouterTestingModule for routing services
        HttpClientModule     // Add HttpClientModule to handle HTTP requests
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Check if the component is created successfully
    expect(component).toBeTruthy();
  });
});
