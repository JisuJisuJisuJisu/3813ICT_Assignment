import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupDetailComponent } from './group-detail.component';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { HttpClientModule } from '@angular/common/http';


describe('GroupAdminComponent', () => {
  let component: GroupDetailComponent;
  let fixture: ComponentFixture<GroupDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
     
      imports: [GroupDetailComponent,
        HttpClientModule,RouterTestingModule
      ], // 여기에 HttpClientModule 추가
      
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
