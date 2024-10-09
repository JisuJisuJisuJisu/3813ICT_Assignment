import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http'; // HttpClientModule 추가
import { GroupAdminComponent } from './group-admin.component';

describe('GroupAdminComponent', () => {
  let component: GroupAdminComponent;
  let fixture: ComponentFixture<GroupAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone 컴포넌트는 standalone: true가 있어야 하는데, 이 부분이 빠져있을 수 있습니다.
      imports: [GroupAdminComponent], // 여기에 HttpClientModule 추가
      providers: [HttpClientModule] // HttpClientModule을 providers로 추가
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
