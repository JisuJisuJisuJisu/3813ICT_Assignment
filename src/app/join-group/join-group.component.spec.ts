import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { JoinGroupComponent } from './join-group.component';
import { HttpClientModule } from '@angular/common/http';

describe('JoinGroupComponent', () => {
  let component: JoinGroupComponent;
  let fixture: ComponentFixture<JoinGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        JoinGroupComponent, // Import the standalone component
        RouterTestingModule, // Add RouterTestingModule to provide routing services
        HttpClientModule,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Check if the component is created successfully
    expect(component).toBeTruthy();
  });
});
