import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { GroupMemberComponent } from './groupmember.component';

describe('GroupMemberComponent', () => {
  let component: GroupMemberComponent;
  let fixture: ComponentFixture<GroupMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GroupMemberComponent,  // Import the standalone component
        HttpClientModule,      // Add HttpClientModule to handle HTTP requests
        RouterTestingModule    // Add RouterTestingModule for routing services (if needed)
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Check if the component is created successfully
    expect(component).toBeTruthy();
  });
});
