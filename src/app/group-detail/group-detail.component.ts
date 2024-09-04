import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Group } from '../models/group.model';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {
  group: Group | null = null;

  @Output() channelsUpdated = new EventEmitter<any[]>();  // 부모로 채널 전달

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id');  // URL에서 그룹 ID를 추출

    if (groupId) {
      this.http.get<Group>(`http://localhost:3000/groups/${groupId}`).subscribe({
        next: (group) => {
          this.group = group;
          this.channelsUpdated.emit(group.channels);  // 채널 정보를 부모로 전달
        },
        error: (err) => {
          console.error('그룹 정보를 가져오는 중 오류 발생:', err);
        }
      });
    }
  }
}
