import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupAdminComponent } from './group-admin.component';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { HttpClientModule } from '@angular/common/http';


describe('GroupAdminComponent', () => {
  let component: GroupAdminComponent;
  let fixture: ComponentFixture<GroupAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
     
      imports: [GroupAdminComponent,
        HttpClientModule,RouterTestingModule
      ], // 여기에 HttpClientModule 추가
      
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
