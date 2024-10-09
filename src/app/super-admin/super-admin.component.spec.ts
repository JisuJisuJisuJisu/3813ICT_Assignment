import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { SuperAdminComponent } from './super-admin.component';

describe('SuperAdminComponent', () => {
  let component: SuperAdminComponent;
  let fixture: ComponentFixture<SuperAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SuperAdminComponent,  // Import the standalone component
        RouterTestingModule,  // Add RouterTestingModule for routing services
        HttpClientModule      // Add HttpClientModule to handle HTTP requests
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Check if the component is created successfully
    expect(component).toBeTruthy();
  });
});
