import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';


@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css'],
  standalone: true,
  imports: [CommonModule]  
})
export class GroupDetailComponent implements OnInit {
  group: Group | null = null;
  isLoading = true;  // 로딩 상태를 나타내는 변수 추가

  @Output() channelsUpdated = new EventEmitter<Channel[]>();  // 부모로 채널 전달

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id');  // URL에서 그룹 ID를 추출

    if (groupId) {
      this.http.get<Group>(`http://localhost:3000/groups/${groupId}`).subscribe({
        next: (group) => {
          console.log("Group data:", group);
          this.group = group;
          this.channelsUpdated.emit(group.channels);  // 채널 정보를 부모로 전달
          this.isLoading = false;  // 데이터가 로드된 후 로딩 상태 변경
        },
        error: (err) => {
          console.error('그룹 정보를 가져오는 중 오류 발생:', err);
          this.isLoading = false;  // 오류 발생 시에도 로딩 상태 변경
        }
      });
    }
  }
}
