import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Group } from '../models/group.model'; // Group 모델을 가져옴
import { Channel } from '../models/channel.model'; // Channel 모델을 가져옴

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {

  group: Group | null = null;  // 현재 그룹 정보를 저장
  userChannels: Channel[] = []; // 채널 목록을 저장

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id'); 
    console.log('Received Group ID:', groupId);// URL에서 그룹 ID 추출
    if (groupId) {
      this.http.get<Group>(`http://localhost:3000/groups/${groupId}`).subscribe({
        next: (group) => {
          this.group = group;
          this.userChannels = group.channels;  // 그룹의 채널 목록을 userChannels에 저장
        },
        error: (error) => {
          console.error('그룹 정보를 가져오는 중 오류 발생:', error);
        }
      });
    }
  }
}
