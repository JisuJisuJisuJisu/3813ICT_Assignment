import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http'; // HttpClientModule 추가
import { ActivatedRoute } from '@angular/router'; // ActivatedRoute 추가
import { of } from 'rxjs'; // Mock ActivatedRoute를 위해 필요

import { ChannelComponent } from './channel.component';

describe('ChannelComponent', () => {
  let component: ChannelComponent;
  let fixture: ComponentFixture<ChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelComponent, HttpClientModule], // HttpClientModule 추가
      providers: [
        {
          provide: ActivatedRoute, 
          useValue: {
            paramMap: of({ get: (key: string) => 'test-channel-id' }) // Mock ActivatedRoute
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
