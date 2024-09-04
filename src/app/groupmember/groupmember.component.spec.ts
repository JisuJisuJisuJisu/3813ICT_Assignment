import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMemberComponent } from './groupmember.component';

describe('GroupmemberComponent', () => {
  let component: GroupMemberComponent;
  let fixture: ComponentFixture<GroupMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
