import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http'; // HttpClientModule 추가
import { GroupAdminComponent } from './group-admin.component';

describe('GroupAdminComponent', () => {
  let component: GroupAdminComponent;
  let fixture: ComponentFixture<GroupAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
     
      imports: [GroupAdminComponent], // 여기에 HttpClientModule 추가
      providers: [HttpClientModule] 
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
