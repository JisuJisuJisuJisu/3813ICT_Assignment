import { Channel } from './channel.model';
import { User } from './user.model';  

export interface Group {
  id: string;          
  name: string;        
  description: string;
  channels: Channel[]; 
  createdBy: string;
  imageUrl?: string;
  pendingUsers?: User[]; 
}
