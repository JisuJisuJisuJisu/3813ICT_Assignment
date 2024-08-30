import { Channel } from './channel.model';

export interface Group {
  id: string;          // 고유한 그룹 ID
  name: string;        // 그룹 이름
  channels: Channel[]; // 그룹 내의 채널들을 저장하는 배열
}
