import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http'; // HttpClientModule 추가
import { ActivatedRoute } from '@angular/router'; // ActivatedRoute 추가
import { of } from 'rxjs'; // Mock ActivatedRoute를 위해 필요

import { GroupDetailComponent } from './group-detail.component';

describe('GroupDetailComponent', () => {
  let component: GroupDetailComponent;
  let fixture: ComponentFixture<GroupDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupDetailComponent], // GroupDetailComponent를 declarations에 추가
      imports: [HttpClientModule], // HttpClientModule 추가
      providers: [
        {
          provide: ActivatedRoute, 
          useValue: {
            paramMap: of({ get: (key: string) => 'test-group-id' }) // Mock ActivatedRoute 설정
          }
        }
      ]
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
